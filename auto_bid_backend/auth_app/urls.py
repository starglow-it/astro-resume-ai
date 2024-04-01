from django.urls import path, include
from .views import CustomConfirmEmailView, CustomLoginView

urlpatterns = [
    path('', include('dj_rest_auth.urls')),
    path('login/', CustomLoginView.as_view(), name='custom_login'),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('account-confirm-email/<str:key>/', CustomConfirmEmailView.as_view(), name="account_confirm_email")
]