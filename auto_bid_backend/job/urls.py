from django.urls import path
from .views import ScrapeJobsView

urlpatterns = [
    path('scrape-jobs/', ScrapeJobsView.as_view(), name='scrape_jobs'),
]
