from django.urls import path
from api.views.jira import views
from .views import FeedbackView

urlpatterns = [
    path('jira/feedback/', FeedbackView.as_view(), name='feedback'),
    path("jira/create_new_feedback/",
         views.create_new_feedback, name="create_new_feedback"),
    path("jira/upload_servicedesk_attachment",
         views.upload_servicedesk_attachment, name="upload_servicedesk_attachment"),
    path("jira/attach_feedback_attachment",
         views.upload_servicedesk_attachment, name="attach_feedback_attachment")
]
