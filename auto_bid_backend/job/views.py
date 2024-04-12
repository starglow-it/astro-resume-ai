from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.serializers import serialize
from functools import reduce

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.generics import ListAPIView

from urllib.parse import urlparse

from .models import JobPost
from .serializers import JobPostSerializer, ScoreSerializer
from .scraping import scrape_jobs_modified
from resume_api.views import get_matching_scores
from profile_management.models import Profile
from profile_management.serializers import ProfileSerializer

import pandas as pd
import numpy as np
from datetime import datetime
import json


def domain_from_url(url):
    """
    Returns the domain from a given URL.
    """
    parsed_url = urlparse(url)
    return parsed_url.netloc

def check_easy_apply(url):
    domain = urlparse(url).netloc

    if domain in ('www.linkedin.com', 'www.indeed.com', 'www.ziprecruiter.com', 'www.glassdoor.com'):
        return True
    else :
        return False

class ScrapeJobsView(APIView):
    """
    Scrapes jobs from a given site and returns a list of JobPost objects.
    """
    filter_backends = (SearchFilter, OrderingFilter)
    ordering_fields = 'all'


    def post(self, request, *args, **kwargs):
        # Extract parameters from the request
        params = request.data

        # Scrape jobs and save to jobs_dataframe
        jobs_dataframe = scrape_jobs_modified(
            site_name=params.get('site_name'),
            search_term=params['search_term'],
            location=params['location'],
            is_remote=params.get('is_remote', False),
            hours_old=params.get('hours_old', 168),
            country_indeed=params.get('country_indeed', 'USA'),
            results_wanted=params.get('results_wanted', 100)
        )

        # Ensure jobs_data is a DataFrame before continuing
        if not isinstance(jobs_dataframe, pd.DataFrame):
            return Response({"error": "Scraped jobs data is not in DataFrame format."}, status=status.HTTP_400_BAD_REQUEST)

        # Preprocess the DataFrame to convert special float values to None
        jobs_dataframe.replace([np.inf, -np.inf, np.nan], None, inplace=True)

        # Iterate over scraped job data, serialize and save to DB
        for index, job_data in jobs_dataframe.iterrows():
            # Convert date format to "YYYY-MM-DD" format
            if job_data.get('date_posted') != None:
                job_data['date_posted'] = job_data['date_posted'].strftime("%Y-%m-%d")  # Converts to "YYYY-MM-DD" format

            # Check each value in dataframe to see if it is a special float value
            for key, value in jobs_dataframe.items():
                if isinstance(value, float) and (np.isnan(value) or np.isinf(value)):
                    job_data_dict[key] = None

            # Calculate 'is_easy_apply'
            # job_url_domain = domain_from_url(job_data.get('job_url', ''))
            # job_url_direct_domain = domain_from_url(job_data.get('job_url_direct', ''))
            # job_data['is_easy_apply'] = job_url_domain == job_url_direct_domain
            job_data['is_easy_apply'] = check_easy_apply(job_data.get('job_url_direct', ''))

            # Check if the job_url already exists in the DB
            if JobPost.objects.filter(job_url=job_data.get('job_url', '')).exists():
                print(f'Job with URL {job_data.get("job_url", "")} already exists in the DB')
                pass

            # Convert dataframe to dict            
            job_data_dict = job_data.to_dict()

            serializer = JobPostSerializer(data=job_data_dict)

            # Check if serializer is valid
            if serializer.is_valid():
                serializer.save()
            else:
                # Handle invalid data if necessary
                print(serializer.errors)
                pass

        return Response({"message": "Jobs scraped and saved successfully"}, status=status.HTTP_200_OK)
    
    def get(self, request, *args, **kwargs):
        queryset = JobPost.objects.all()  # Assuming you want the newest jobs first
        # Example URL https://example.com/jobs?filters=location:usa,is_remote:false&sort=title:asc

        # Filter by search term
        filter_params = self.request.query_params.get('filters')

        if filter_params:
            filter_terms = filter_params.split(',')
            queryset = queryset.filter(
                reduce(
                    lambda q, term: q & Q(**{term.split(':')[0] + '__icontains': term.split(':')[1]}),
                    filter_terms,
                    Q()
                )
            )

        # Sort by date posted and title
        sort_by = self.request.query_params.get('sort')

        if sort_by:
            field, order = sort_by.split(':')
            queryset = queryset.order_by(f"{'-' if order == 'desc' else ''}{field}")

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = JobPostSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = JobPostSerializer(queryset, many=True)

        return Response(serializer.data)
    
    
class AnalyzeJobsView(APIView):
    """
    Analyze a given job and recommend top-score profile and the score
    """

    def post(self, request, *args, **kwargs):
        job_ids = request.data.get('jobs', [])
        user_profiles = Profile.objects.filter(user=request.user)

        result = {}

        for job_id in job_ids:
            job = get_object_or_404(JobPost, id=job_id)
            
            max_score = 0.0
            top_profile = None

            for profile in user_profiles:
                profileSerializer = ProfileSerializer(profile)

                # Calculate score for given job and profile            
                calculated_score = get_matching_scores([json.dumps(profileSerializer.data)], [job.description])[0]

                # Check if the score is higher than the max score
                if calculated_score > max_score:
                    max_score = calculated_score
                    top_profile = profile.id

                # Save or update the score
                serializer = ScoreSerializer(data={"job": job_id, "profile": profile.id, "score": calculated_score})

                if serializer.is_valid():
                    serializer.save()
                else:
                    print(serializer.errors)
                    pass
            
            # Save or update the max score and top profile to results
            result[job_id] = {
                "max_score": max_score,
                "top_profile": top_profile
            }

        return Response({'message': 'Successfully analyzed jobs', 'results': result}, status=status.HTTP_200_OK)
    