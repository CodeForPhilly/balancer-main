from django.urls import path
from .views import UploadFileView

urlpatterns = [
    path("v1/api/uploadFile", UploadFileView.as_view(), name="uploadFiles")
]
