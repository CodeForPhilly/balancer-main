from django.urls import path
from api.views.chatgpt import views

urlpatterns = [
    path("chatgpt/extract_text/", views.extract_text, name="post_web_text"),
    path("chatgpt/diagnosis/", views.diagnosis, name="post_diagnosis"),
    path("chatgpt/chat", views.chatgpt, name="chatgpt"),
    path("chatgpt/chat_history", views.chat_history, name="chat_history")
] 
