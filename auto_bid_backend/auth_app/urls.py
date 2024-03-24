from django.urls import path, include
# from .views import RegisterView, LoginView
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import CustomConfirmEmailView


urlpatterns = [
    # path('register/', RegisterView.as_view(), name='register'),
    # path('login/', LoginView.as_view(), name='login'),
    # path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('account-confirm-email/<str:key>/', CustomConfirmEmailView.as_view(), name="account_confirm_email")
]