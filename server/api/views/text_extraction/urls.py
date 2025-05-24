from django.urls import path
from .views import RuleExtractionAPIView


urlpatterns = [

    path('v1/api/rule_extraction', RuleExtractionAPIView.as_view(),
         name='rule_extraction')
]
