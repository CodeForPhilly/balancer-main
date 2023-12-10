from django.urls import path
from api.views.uploadFile import views

urlpatterns = [
    path("chatgpt/uploadFile", views.uploadFiles, name="uploadFile")
]
