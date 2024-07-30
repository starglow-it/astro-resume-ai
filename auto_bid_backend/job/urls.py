from django.urls import path
from .views import ScrapeJobsView, AnalyzeJobsView, DeleteSelectedJobsView

urlpatterns = [
    path('delete-selected/', DeleteSelectedJobsView.as_view(), name='delete_selected_jobs_by_ids'),
    path('scrape/', ScrapeJobsView.as_view(), name='scrape_jobs'),
    path('analyze/', AnalyzeJobsView.as_view(), name='analyze_jobs'),
]
