from django.urls import path
from api.views.listMeds import views

urlpatterns = [
    path("chatgpt/list_meds", views.medication, name="listMeds")
]
