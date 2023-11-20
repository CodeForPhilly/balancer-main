from django.urls import path
from api.views.test.views import test

urlpatterns = [
    path("test/", test.as_view(), name="test")
]