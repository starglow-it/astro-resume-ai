from django.db import models
from profile_management.models import Profile

# Create your models here.
class Answer(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    question =  models.CharField(max_length=255)
    isOptional = models.BooleanField(default=False, blank=True, null=True)
    inputType = models.CharField(max_length=255, default="text")
    answer = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.profile}'s answer to {self.question}"