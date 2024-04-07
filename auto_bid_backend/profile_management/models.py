from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.ForeignKey(User, related_name='profiles', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    recent_role = models.CharField(max_length=255)
    phone = models.CharField(max_length=255, blank=True, null=True)  
    location = models.CharField(max_length=255, blank=True, null=True)  
    summary = models.TextField(blank=True, null=True)  
    skills = models.JSONField(default=list)  
    work_authorization = models.CharField(max_length=255, blank=True)  
    website = models.CharField(max_length=255, blank=True, null=True)
    linkedin = models.CharField(max_length=255, blank=True, null=True)
    github = models.CharField(max_length=255, blank=True, null=True)

class Education(models.Model):
    profile = models.ForeignKey(Profile, related_name='education', on_delete=models.CASCADE)
    university = models.CharField(max_length=255)
    education_level = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.CharField(max_length=255, blank=True, null=True)
    major = models.CharField(max_length=255, blank=True, null=True)

class Experience(models.Model):
    profile = models.ForeignKey(Profile, related_name='experience', on_delete=models.CASCADE)
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    duration = models.CharField(max_length=255, blank=True, null=True)
    description = models.JSONField(default=list)