from django.urls import path
from .views import ProfileCreateAPIView, ProfileUpdateAPIView, ProfileDeleteAPIView, UserProfileListView, AllProfilesListView

urlpatterns = [
    path('create/', ProfileCreateAPIView.as_view(), name='create-profile'),
    path('update/<int:id>/', ProfileUpdateAPIView.as_view(), name='update-profile'),
    path('delete/<int:id>/', ProfileDeleteAPIView.as_view(), name='delete-profile'),
    path('get-list/', UserProfileListView.as_view(), name="user-profiles-list"),
    path('get-profiles-list/', AllProfilesListView.as_view(), name="profiles-list")
]