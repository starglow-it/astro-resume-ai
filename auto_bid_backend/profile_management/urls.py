from django.urls import path
from .views import ProfileCreateAPIView, UserProfileListView

urlpatterns = [
    path('create/', ProfileCreateAPIView.as_view(), name='create-profile'),
    path('get-list/', UserProfileListView.as_view(), name="user-profiles-list")
]