from django.urls import path
from .views import UploadFileView, RetrieveUploadFileView

urlpatterns = [
    path("v1/api/uploadFile", UploadFileView.as_view(), name="uploadFiles"),
    path("v1/api/uploadFile/<str:guid>",
         RetrieveUploadFileView.as_view(), name="Get UploadFiles")
]
