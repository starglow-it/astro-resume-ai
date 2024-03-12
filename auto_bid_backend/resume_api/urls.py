from django.urls import path
from . import views

urlpatterns = [
    path('generate-resume/', views.generate_resume, name='generate-resume'),
    path('resumes/', views.resumes, name='resumes'),
    path('resumes/<uuid:resume_id>/', views.resume_detail, name='resume-detail'),
    path('delete-resumes/', views.delete_resumes, name='delete-resumes'),
]
