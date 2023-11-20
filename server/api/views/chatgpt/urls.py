from django.urls import path
from api.views.chatgpt import views
from api.views.chatgpt.views import ChatGPT

urlpatterns = [
    path("chatgpt/extract_text/", views.extract_text, name="post_web_text"),
    path("chatgpt/diagnosis/", views.diagnosis, name="post_diagnosis"),
    path("api/chatgpt/chat", ChatGPT.as_view(), name="chatgpt")
] 
