# from django.contrib.auth.models import User
# from django.contrib.auth import authenticate
# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from .serializers import RegisterSerializer, LoginSerializer
from django.http import JsonResponse
from allauth.account.views import ConfirmEmailView
from django.shortcuts import redirect

class CustomConfirmEmailView(ConfirmEmailView):
    def get(self, *args, **kwargs):
        try:
            confirmation = self.get_object()
            confirmation.confirm(self.request)
        except Exception as e: 
            print('Email confirmation failed:', str(e))

            return redirect('http://localhost:3000/pages/confirm-error')    
        else:
            return redirect('http://localhost:3000/pages/login')

    # Override this method to prevent template rendering
    def render_to_response(self, context, **response_kwargs):
        print('RENDER_TO_RESPONSE')
        return self.response_class(data=context, **response_kwargs)



# class RegisterView(generics.GenericAPIView):
#     serializer_class = RegisterSerializer

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             return Response({
#                 "user": RegisterSerializer(user, context=self.get_serializer_context()).data,
#                 "message": "User Created Successfully.  Now perform Login to get your token",
#             })
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class LoginView(APIView):
#     serializer_class = LoginSerializer

#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             username = serializer.validated_data.get('email')  # Now, this is the username
#             password = serializer.validated_data.get('password')
#             user = authenticate(username=username, password=password)

            