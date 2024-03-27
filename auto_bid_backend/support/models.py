from django.db import models
from django.contrib.auth.models import User

class Support(models.Model):
    url = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Support request by {self.url}"
