from rest_framework import serializers
from .models import JobPost, Score

class JobPostSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = JobPost
        fields = '__all__'

class ScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Score
        fields = '__all__'