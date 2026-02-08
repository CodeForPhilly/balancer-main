from django.urls import path
from .views import VersionView

urlpatterns = [
    path("v1/api/version", VersionView.as_view(), name="version"),
]
