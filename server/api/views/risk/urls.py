from django.urls import path
from api.views.risk import views
from api.views.risk.views_riskWithSources import RiskWithSourcesView

urlpatterns = [
    path("chatgpt/risk", views.medication, name="risk"),
    path("v1/api/riskWithSources", RiskWithSourcesView.as_view()),
]
