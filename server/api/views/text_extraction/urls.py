from django.urls import path

from .views import RuleExtractionAPIView, RuleExtractionAPIOpenAIView

urlpatterns = [
    path(
        "v1/api/rule_extraction",
        RuleExtractionAPIView.as_view(),
        name="rule_extraction",
    ),
    path(
        "v1/api/rule_extraction_openai",
        RuleExtractionAPIOpenAIView.as_view(),
        name="rule_extraction_openai",
    ),
]
