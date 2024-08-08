from rest_framework import serializers
from .models import Profile, Education, Experience

class EducationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = Education
        fields = '__all__'
        extra_kwargs = {'profile': {'required': False, 'allow_null': True}}

class ExperienceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
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
    
    def update(self, instance, validated_data):
        education_data = validated_data.pop('education', [])
        for education_dict in education_data:
            education_id = education_dict.get('id', None)
            if education_id:
                # Update existing Education object
                Education.objects.filter(id=education_id, profile=instance).update(**education_dict)
            else:
                # Create new Education object
                education_dict.pop('profile', None)  # Ensure 'profile' is not in the dict
                Education.objects.create(profile=instance, **education_dict)

        experience_data = validated_data.pop('experience', [])
        for experience_dict in experience_data:
            experience_id = experience_dict.get('id', None)
            if experience_id:
                # Update existing Experience object
                Experience.objects.filter(id=experience_id, profile=instance).update(**experience_dict)
            else:
                # Create new Experience object
                experience_dict.pop('profile', None)  # Ensure 'profile' is not in the dict
                Experience.objects.create(profile=instance, **experience_dict)

        # Update the Profile instance with any remaining fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class ProfileIdUsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'name']
