from django.db import models

class JobQuery(models.Model):
    id = models.AutoField(primary_key=True)
    url = models.TextField(default='')
    title_query = models.TextField(default='')
    description_query = models.TextField(default='')

    def __str__(self):
        return f"JobQuery: {self.url}"