from django.db import models
import uuid
from django.contrib.auth.models import User
from profile_management.models import Profile

class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_url = models.TextField()
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    summary = models.TextField()
    experience = models.JSONField()
    skills = models.JSONField()
    hide_text = models.TextField()

    def __str__(self):
        return f"Resume {self.id}" 

class JobDescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_url = models.TextField()
    title = models.TextField()
    description = models.TextField()

    def __str__(self):
        return f"Job Description {self.id}" 
