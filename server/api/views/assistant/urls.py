from django.urls import path

from .views import Assistant

urlpatterns = [path("v1/api/assistant", Assistant.as_view(), name="assistant")]
