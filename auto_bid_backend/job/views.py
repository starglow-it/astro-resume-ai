from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import JobPost
from .serializers import JobPostSerializer
from .scraping import scrape_jobs_modified
import pandas as pd
from datetime import datetime

class ScrapeJobsView(APIView):
    def post(self, request, *args, **kwargs):
        # Extract parameters from the request
        params = request.data

        # Synchronously execute the asynchronous scraping function
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

        # Iterate over scraped job data, serialize and save to DB
        for index, job_data in jobs_dataframe.iterrows():
            # Check if 'interval' is 'nan' and replace it with `None`
            if job_data.get('interval') == "nan" or pd.isna(job_data.get('interval')):
                job_data['interval'] = None

            if job_data.get('date_posted') != None:
                # date_obj = datetime.strptime(job_data['date_posted'], "%d-%b-%Y")
                job_data['date_posted'] = job_data['date_posted'].strftime("%Y-%m-%d")  # Converts to "YYYY-MM-DD" format

            job_data_dict = job_data.to_dict()

            serializer = JobPostSerializer(data=job_data_dict)

            if serializer.is_valid():
                serializer.save()
            else:
                # Handle invalid data if necessary
                print(serializer.errors)
                pass

        return Response({"message": "Jobs scraped and saved successfully"}, status=status.HTTP_200_OK)
    
    
