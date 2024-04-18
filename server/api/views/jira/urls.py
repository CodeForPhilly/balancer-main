from django.urls import path
from api.views.jira import views

urlpatterns = [
    path("api/jira/create_new_feedback/", views.create_new_feedback, name="create_new_feedback"),
    path("api/jira/upload_servicedesk_attachment", views.upload_servicedesk_attachment, name="upload_servicedesk_attachment"),
    path("api/jira/attach_feedback_attachment", views.upload_servicedesk_attachment, name="attach_feedback_attachment")
] 
