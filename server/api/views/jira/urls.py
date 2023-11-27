from django.urls import path
from api.views.jira.views import CreateNewFeedback, UploadServiceDeskAttachment, AttachFeedback

urlpatterns = [
    path("api/jira/create_new_feedback/", CreateNewFeedback.as_view(), name="new_feedback"),
    path("api/jira/upload_servicedesk_attachment", UploadServiceDeskAttachment.as_view(), name="upload_servicedesk_attachment"),
    path("api/jira/attach_feedback_attachment", AttachFeedback.as_view(), name="attach_feedback_attachment")
] 
