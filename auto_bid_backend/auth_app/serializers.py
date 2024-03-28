from dj_rest_auth.serializers import TokenSerializer
from rest_framework import serializers
from rest_framework.authtoken.models import Token

class CustomTokenSerializer(TokenSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta(TokenSerializer.Meta):
        model = Token
        fields = ('key', 'username')
