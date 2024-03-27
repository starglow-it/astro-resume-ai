from django.contrib import admin
from .models import JobQuery

@admin.register(JobQuery)
class JobQueryAdmin(admin.ModelAdmin):
    list_display = ('url', 'title_query', 'description_query')
