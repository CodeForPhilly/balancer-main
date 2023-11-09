from django.urls import path
from balancer_backend.views.jira import views

urlpatterns = [
    path("jira/create_new_feedback/", views.create_new_feedback, name="create_new_feedback"),
    path("jira/upload_servicedesk_attachment", views.upload_servicedesk_attachment, name="upload_servicedesk_attachment"),
    path("jira/attach_feedback_attachment", views.upload_servicedesk_attachment, name="attach_feedback_attachment")
] 
