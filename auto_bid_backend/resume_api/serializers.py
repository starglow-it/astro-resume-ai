from rest_framework import serializers
from .models import Resume, JobDescription

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'user_id', 'personal_information', 'profile', 'experience', 'skills', 'hide_text']

class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = '__all__'
