from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views.conversations import views

router = DefaultRouter()
router.register(r"conversations", views.ConversationViewSet, basename="conversation")

urlpatterns = [
    path("chatgpt/extract_text/", views.extract_text, name="post_web_text"),
    path("chatgpt/", include(router.urls)),
]
