from django.urls import path
from .views import UploadFileView, RetrieveUploadFileView, EditFileMetadataView

urlpatterns = [
    path("v1/api/uploadFile", UploadFileView.as_view(), name="uploadFiles"),
    path("v1/api/uploadFile/<str:guid>",
         RetrieveUploadFileView.as_view(), name="Get UploadFiles"),
    path("v1/api/editmetadata/<str:guid>",
         EditFileMetadataView.as_view(), name="editFileMetadata"),
]
