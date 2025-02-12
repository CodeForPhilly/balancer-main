from django.urls import path
from .views import TextExtractionAPIView


urlpatterns = [

    path('v1/api/text_extraction', TextExtractionAPIView.as_view(),
         name='text_extraction'),
]
