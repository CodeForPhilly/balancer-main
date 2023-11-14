from django.urls import path
from api.views.listDrugs import views

urlpatterns = [
    path("chatgpt/list_drugs", views.medication, name="listDrugs")
] 
