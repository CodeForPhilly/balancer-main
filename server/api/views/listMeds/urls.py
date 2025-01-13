
from django.urls import path
from .views import GetMedication, ListOrDetailMedication, AddMedication

urlpatterns = [
    path('v1/api/get_fulL_list_med', ListOrDetailMedication.as_view(), name='list_or_detail_medication'),
    path('v1/api/get_med_recommend', GetMedication.as_view(), name='get_medication'),
    path('v1/api/add_medication', AddMedication.as_view(), name='add_medication'),  # New POST endpoint
]
