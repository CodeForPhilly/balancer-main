from django.urls import path
from api.views.risk import views

urlpatterns = [
    path("api/chatgpt/risk", views.medication, name="risk")
] 
