from django.urls import path
from .views import parse_resume

urlpatterns = [
    path('', parse_resume, name='parse-resume'),
]
