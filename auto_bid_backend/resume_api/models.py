from django.db import models
import uuid

class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    personal_information = models.JSONField()
    profile = models.JSONField()
    experience = models.JSONField()
    skills = models.JSONField()
    hide_text = models.TextField()

    def __str__(self):
        return self.personal_information.get("name", "No Name")

class JobDescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_url = models.TextField()
    title = models.TextField()
    description = models.TextField()

    def __str__(self):
        return f"Job Description {self.id}"
