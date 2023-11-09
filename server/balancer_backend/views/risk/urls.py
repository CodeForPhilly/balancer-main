from django.urls import path
from balancer_backend.views.risk import views

urlpatterns = [
    path("chatgpt/risk", views.medication, name="risk")
] 
