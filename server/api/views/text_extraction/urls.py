from django.urls import path
from .views import TextExtractionAPIView, RuleExtractionAPIView


urlpatterns = [

    path('v1/api/text_extraction', TextExtractionAPIView.as_view(),
         name='text_extraction'),

    path('v1/api/rule_extraction', RuleExtractionAPIView.as_view(),
         name='rule_extraction')
]
