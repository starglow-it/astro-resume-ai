from django.urls import path
from . import views

urlpatterns = [
    path('supports/', views.support_list),
    path('supports/<int:pk>/', views.support_detail),
]
