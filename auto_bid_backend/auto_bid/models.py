from django.db import models
from profile_management.models import Profile

# Create your models here.
class StandardQuestion(models.Model):
    standard_question = models.TextField()

    def __str__(self):
        return self.standard_question[:50]
    
class Question(models.Model):
    question = models.CharField(max_length=255)
    standard_question = models.ForeignKey(StandardQuestion, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.question}. Standard question is {self.standard_question}"
    
class Answer(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    # question =  models.CharField(max_length=255)
    standard_question =  models.ForeignKey(StandardQuestion, on_delete=models.CASCADE)
    isOptional = models.BooleanField(default=False, blank=True, null=True)
    inputType = models.CharField(max_length=255, default="text")
    answer = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.profile}'s answer to {self.question}"
    