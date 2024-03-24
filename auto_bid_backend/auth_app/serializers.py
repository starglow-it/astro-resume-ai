# from django.contrib.auth.models import User
# from django.contrib.auth.password_validation import validate_password
# from rest_framework import serializers

# class RegisterSerializer(serializers.ModelSerializer):
#     email = serializers.EmailField(required=True)
#     password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
#     # password2 = serializers.CharField(write_only=True, required=True)
#     # Optional: Include first_name and last_name if you want to capture these details
#     first_name = serializers.CharField(required=False)
#     last_name = serializers.CharField(required=False)

#     class Meta:
#         model = User
#         fields = ('email', 'password', 'first_name', 'last_name')

#     def validate_email(self, value):
#         # Ensure email is unique
#         if User.objects.filter(username=value).exists():
#             raise serializers.ValidationError("A user with that email already exists.")
#         return value

#     # def validate(self, data):
#     #     if data['password'] != data['password2']:
#     #         raise serializers.ValidationError({"password": "Password fields didn't match."})
#     #     return data

#     def create(self, validated_data):
#         user = User.objects.create_user(
#             username=validated_data['email'],  # Use email as username
#             email=validated_data['email'],
#             password=validated_data['password'],
#             first_name=validated_data.get('first_name', ''),
#             last_name=validated_data.get('last_name', '')
#         )
#         return user

# class LoginSerializer(serializers.Serializer):
#     email = serializers.EmailField(required=True)
#     password = serializers.CharField(required=True, write_only=True)
