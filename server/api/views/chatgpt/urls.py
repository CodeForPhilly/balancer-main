from django.urls import path
from api.views.chatgpt import views

urlpatterns = [
    path("api/chatgpt/extract_text/", views.extract_text, name="post_web_text"),
    path("api/chatgpt/diagnosis/", views.diagnosis, name="post_diagnosis"),
    path("api/chatgpt/chat", views.chatgpt, name="chatgpt"),
] 
