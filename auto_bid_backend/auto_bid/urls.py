from django.urls import path
from . import views

urlpatterns = [
    path('save-answers/', views.save_answers, name="save-answers"),
    path('get-answer/', views.get_answer, name="get-answer")
]
