from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import JobPost
from .serializers import JobPostSerializer

class JobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
