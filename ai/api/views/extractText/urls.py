from django.urls import path
from .views import ExtractTextAPIView

urlpatterns = [
    path('api/extractText/', ExtractTextAPIView.as_view(),
         name='extractText'),
]
