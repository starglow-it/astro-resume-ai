from django.urls import path
from . import views

urlpatterns = [
    path('save-answers/', views.save_answers, name="save-answers"),
    path('get-answers/', views.get_answers, name="get-answers"),
]
