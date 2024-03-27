from rest_framework import serializers
from .models import Profile, Education, Experience

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        extra_kwargs = {'profile': {'required': False, 'allow_null': True}}

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        extra_kwargs = {
            'profile': {'required': False, 'allow_null': True},
            'location': {'required': False, 'allow_null': True}
        }

class ProfileSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True)
    experience = ExperienceSerializer(many=True)

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user',)

        extra_kwargs = {
            # Specify optional fields here
            'phone': {'required': False, 'allow_null': True},
            'location': {'required': False, 'allow_null': True},
            'summary': {'required': False, 'allow_null': True},
            'skills': {'required': False, 'allow_null': True},
            'work_authorization': {'required': False, 'allow_null': True},
            'website': {'required': False, 'allow_null': True},
            'linkedin': {'required': False, 'allow_null': True},
            'github': {'required': False, 'allow_null': True},
            # 'name' and 'email' are required by default, so no need to specify them here
        }


    def create(self, validated_data):
        education_data = validated_data.pop('education', [])
        experience_data = validated_data.pop('experience', [])
        profile = Profile.objects.create(**validated_data)

        for education in education_data:
            Education.objects.create(profile=profile, **education)
        for experience in experience_data:
            Experience.objects.create(profile=profile, **experience)

        return profile