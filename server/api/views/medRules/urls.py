from django.urls import path
from .views import MedRules, ListOrDetailMedication

urlpatterns = [
    path("v1/api/medRules",
         MedRules.as_view(), name="medRules"),
             path('v1/api/get_full_list_med2', ListOrDetailMedication.as_view(),
         name='list_or_detail_medication'),

]
