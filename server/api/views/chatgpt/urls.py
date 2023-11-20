from django.urls import path
from api.views.chatgpt.views import ChatGPT, ExtractText, Diagnosis

urlpatterns = [
    path("api/chatgpt/chat/", ChatGPT.as_view(), name="post_chat"),
    path("api/chatgpt/extract_text/", ExtractText.as_view(), name="post_web_text"),
    path("api/chatgpt/diagnosis/", Diagnosis.as_view(), name="post_diagnosis")
]
