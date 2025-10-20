from django.urls import path
from .views import RuleExtractionAPIOpenAIView


urlpatterns = [
    path(
        "v1/api/rule_extraction_openai",
        RuleExtractionAPIOpenAIView.as_view(),
        name="rule_extraction_openai",
    )
]
