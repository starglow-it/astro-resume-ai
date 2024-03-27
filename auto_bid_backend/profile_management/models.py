from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.ForeignKey(User, related_name='profiles', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    recent_role = models.CharField(max_length=255)
    phone = models.CharField(max_length=255, blank=True)  # Assuming this can be optional as well
    location = models.CharField(max_length=255, blank=True, null=True)  # Allow null and blank
    summary = models.TextField(blank=True, null=True)  # Assuming this can be optional as well
    skills = models.JSONField(default=list)  # Storing as a list in a JSON field, assumed optional
    work_authorization = models.CharField(max_length=255, blank=True)  # Assuming this can be optional as well
    website = models.CharField(max_length=255, blank=True, null=True)
    linkedin = models.CharField(max_length=255, blank=True, null=True)
    github = models.CharField(max_length=255, blank=True, null=True)

class Education(models.Model):
    profile = models.ForeignKey(Profile, related_name='education', on_delete=models.CASCADE)
    university = models.CharField(max_length=255)
    education_level = models.CharField(max_length=255, blank=True)
    graduation_year = models.CharField(max_length=255, blank=True)
    major = models.CharField(max_length=255, blank=True)

class Experience(models.Model):
    profile = models.ForeignKey(Profile, related_name='experience', on_delete=models.CASCADE)
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    duration = models.CharField(max_length=255, blank=True)
    description = models.TextField()