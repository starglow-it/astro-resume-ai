from django.urls import path
from . import views

urlpatterns = [
    path('save-answers/', views.save_answers, name="save-answers"),
    path('create-answers/', views.create_answers, name="create-answers"),
    path('get-answer/', views.get_answer, name="get-answer"),
    path('get-answers/', views.get_answers, name="get-answers"),
    path('update-answers/', views.update_answers, name="update-answers"),
]
