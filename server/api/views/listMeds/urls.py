from django.urls import path
from api.views.listMeds import views

urlpatterns = [
    path("api/chatgpt/list_meds", views.get_medication, name="listMeds")
]
