from django.urls import path
from .views import ProfileCreateAPIView

urlpatterns = [
    path('create/', ProfileCreateAPIView.as_view(), name='create-profile'),
]