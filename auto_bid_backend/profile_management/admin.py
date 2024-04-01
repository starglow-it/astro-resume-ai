from django.contrib import admin
from .models import Profile, Education, Experience

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'recent_role', 'phone', 'location']
    search_fields = ['name', 'recent_role', 'phone', 'location']
    # Add other configurations as needed

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['profile', 'university', 'education_level', 'graduation_year', 'major']
    search_fields = ['university', 'education_level', 'graduation_year', 'major']
    # Add other configurations as needed

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['profile', 'job_title', 'company', 'location', 'duration']
    search_fields = ['job_title', 'company', 'location', 'duration']
    # Add other configurations as needed
