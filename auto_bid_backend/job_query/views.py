from django.shortcuts import render
from .models import JobQuery
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def job_query_list(request):
    if request.method == 'GET':
        job_queries = JobQuery.objects.all()
        data = [{'url': query.url, 'title_query': query.title_query, 'description_query': query.description_query} for query in job_queries]
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        url = data.get('url', '')
        title_query = data.get('title_query', '')
        description_query = data.get('description_query', '')
        job_query = JobQuery.objects.create(url=url, title_query=title_query, description_query=description_query)
        return JsonResponse({'message': 'JobQuery created successfully', 'id': job_query.pk}, status=201)

@csrf_exempt
def job_query_detail(request, url):
    try:
        job_query = JobQuery.objects.get(url=url)
        data = {'url': job_query.url, 'title_query': job_query.title_query, 'description_query': job_query.description_query}
        return JsonResponse(data)
    except JobQuery.DoesNotExist:
        return JsonResponse({'message': 'JobQuery not found'}, status=404)

@csrf_exempt
def job_query_delete(request, url):
    try:
        job_query = JobQuery.objects.get(url=url)
        job_query.delete()
        return JsonResponse({'message': 'JobQuery deleted successfully'})
    except JobQuery.DoesNotExist:
        return JsonResponse({'message': 'JobQuery not found'}, status=404)
