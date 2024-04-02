from django.urls import path
from . import views

urlpatterns = [
    path('resumes/', views.resumes, name='resumes'),
    path('resumes/generate-resume/', views.generate_resume, name='generate-resume'),
    path('resumes/<uuid:resume_id>/', views.resume_detail, name='resume-detail'),
    path('resumes/user/', views.resumes_by_user, name='resumes-by-user'),
    path('resumes/delete-resumes/', views.delete_resumes, name='delete-resumes'),
    path('resumes/cal_matching_scores/', views.cal_matching_scores, name='cal_matching_scores'),
]
