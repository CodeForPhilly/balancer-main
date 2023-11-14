from django.urls import path
from balancer_backend.views.listMeds import views

urlpatterns = [
    path("chatgpt/listMeds", views.medication, name="listMeds")
]
