from django.urls import path
from .views import ScrapeJobsView, AnalyzeJobsView

urlpatterns = [
    path('scrape/', ScrapeJobsView.as_view(), name='scrape_jobs'),
    path('analyze/', AnalyzeJobsView.as_view(), name='analyze_jobs'),
]
