from django.urls import path
from api.views.uploadFile import views
from .views import UploadFile

urlpatterns = [
    path("api/uploadFile", UploadFile.as_view(), name="uploadFile"),
    path("api/uploadFile/<uuid:guid>/", views.UploadFile.as_view(), name="uploadFileGuid")
]