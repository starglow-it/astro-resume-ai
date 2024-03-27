from django.urls import path
from . import views

urlpatterns = [
    path('job_queries/', views.job_query_list, name='job_query_list'),
    path('job_queries/<str:url>/', views.job_query_detail, name='job_query_detail'),
    path('job_queries/delete/<str:url>/', views.job_query_delete, name='job_query_delete'),
]
