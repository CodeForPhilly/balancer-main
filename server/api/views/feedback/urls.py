from django.urls import path
from api.views.feedback import views
from .views import FeedbackView

urlpatterns = [
    path('v1/api/feedback/', FeedbackView.as_view(), name='feedback'),
]
