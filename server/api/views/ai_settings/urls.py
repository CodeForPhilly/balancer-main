from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.ai_settings import views

urlpatterns = [
    path("ai_settings/settings/",
         views.settings_view, name="settings"),
]
