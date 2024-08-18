from django.urls import path
from api.views.listRules import views

urlpatterns = [
    path("V1/list_rules", views.list_of_rules, name="listRules")
]