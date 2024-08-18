from django.urls import path
from api.views.listRules import views

urlpatterns = [
    path("chatgpt/list_rules", views.rules, name="listRules")
]