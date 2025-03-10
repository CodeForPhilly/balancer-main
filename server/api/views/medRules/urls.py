from django.urls import path
from .views import MedRules

urlpatterns = [
    path("v1/api/medRules",
         MedRules.as_view(), name="medRules"),
]
