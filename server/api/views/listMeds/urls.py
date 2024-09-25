from django.urls import path
from api.views.listMeds import views

urlpatterns = [
    path("v1/api/get_med_recommend",
         views.get_medication, name="get_medication_recommendation"),
    path('v1/api/get_fulL_list_med', views.list_or_detail_medication,
         name='get_list_medications'),
]
