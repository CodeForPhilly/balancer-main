from django.urls import path

from api.views.assistant.views import Assistant

urlpatterns = [path("v1/api/assistant", Assistant.as_view(), name="assistant")]
