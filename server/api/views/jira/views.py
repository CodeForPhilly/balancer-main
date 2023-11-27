from django.http import JsonResponse
from django import forms
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
import requests
import json
import os

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt

class CreateNewFeedback(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @csrf_exempt
    def post(self, request):
        """
        Create a new feedback request in Jira Service Desk.
        """
        token = os.environ.get("JIRA_API_KEY")
        name = request.data.get("name")
        email = request.data.get("email")
        message = request.data.get("message")
        feedback_type = request.data.get("feedbackType")

        match feedback_type:
            case "issue":
                feedback_type_id = 35
            case "feature request":
                feedback_type_id = 36
            case "general":
                feedback_type_id = 33
            case _:
                return  Response({"message": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        url = "https://balancer.atlassian.net/rest/servicedeskapi/request"

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {token}"
        }

        payload = json.dumps(
            {
                "requestFieldValues": {
                    "summary": f"{name} - Feedback",
                    "customfield_10061": email,
                    "description": message,
                },
                "requestTypeId": feedback_type_id,
                "serviceDeskId": "2",
            }
        )

        response = requests.request(
            "POST", url, data=payload, headers=headers
        )
        match response.status_code:
            case 201:
                response_body = json.loads(response.text)
                issue_key = response_body["issueKey"]
                return Response(
                    {"message": "Feedback submitted", "issueKey": issue_key},
                    status=HTTP_201_CREATED
                )
            case 400:
                return Response(
                    {"message": "Invalid request"},
                    status=HTTP_400_BAD_REQUEST    
                )
            case 401 | 403:
                return Response(
                    {"message": "Unauthorized request"},
                    status=HTTP_401_UNAUTHORIZED
                )
            case _:
                return Response(
                    {"message": "Internal server error"},
                    status=HTTP_500_INTERNAL_SERVER_ERROR
                )


class UploadAttachmentForm(forms.Form):
    issueKey: forms.CharField = forms.CharField(max_length=50)
    attachment = forms.FileField()

class UploadServiceDeskAttachment(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @csrf_exempt
    def post(self, request):
        """
        Upload file to temporary files in Jira Service Desk.
        """
        token: = os.environ.get("JIRA_API_KEY")
        form = UploadAttachmentForm(request.POST, request.FILES)
        if form.is_valid():
            url
            
            headers = {
                "Accept": "application/json",
                "X-Atlassian-Token": "no-check",
                "Authorization": f"Basic {token}",
            }

            response = request.request(
                "POST", url, files={"file": request.FILES["attachment"]}, headers=headers
            )
            match response.status_code:
            case 201:
                response_body = json.loads(response.text)
                temp_attachment_id: = response_body["temporaryAttachments"][0][
                    "temporaryAttachmentId"
                ]
                issue_key = request.POST.get("issueKey")
                return Response(
                    {
                        "message": "Attachment uploaded to temporary files",
                        "tempAttachmentId": temp_attachment_id,
                        "issueKey": issue_key,
                    },
                    status=HTTP_200_OK
                )
            case 400:
                return Response({"message": "Invalid request"}, status=HTTP_400_BAD_REQUEST)
            case 401 | 403:
                return Response({"message": "Unauthorized request"}, status=HTTP_401_UNAUTHORIZED)
            case _:
                return Response({"message": "Internal server error"}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({"message": "Invalid form object"}, status=HTTP_400_BAD_REQUEST)


class AttachFeedback(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @csrf_exempt
    """
    Attach a temporary file to a Jira Service Desk issue.
    """
    token = os.environ.get("JIRA_API_KEY")
    issue_key = request.data.get("issueKey")
    temp_attachment_id = request.data.get("tempAttachmentId")

    url = f"https://balancer.atlassian.net/rest/servicedeskapi/request/{issue_key}/attachment"

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Basic {token}",
    }

    payload = json.dumps(
        {"public": True, "temporaryAttachmentIds": [temp_attachment_id]}
    )

    response: requests.Response = requests.request(
        "POST", url, data=payload, headers=headers
    )
    match response.status_code:
        case 201:
            return Response({"message": f"File attached to issue {issue_key}"}, status=HTTP_201_CREATED)
        case 400:
            return Response({"message": "Invalid request"}, status=HTTP_400_BAD_REQUEST)
        case 401 | 403:
            return Response({"message": "Unauthorized request"}, status=HTTP_401_UNAUTHORIZED)
        case _:
            return Response({"message": "Internal server error"}, status=HTTP_500_INTERNAL_SERVER_ERROR)


# These functions are used to get Jira data, but shouldn't be enabled in production.
# Keep these commented out unless in use.

# @csrf_exempt
# def get_jira_servicedesk_list(request: str) -> JsonResponse:
#     """Get jira service desk list."""
#     url = "https://balancer.atlassian.net/rest/servicedeskapi/servicedesk"
#     headers = {
#         "Accept": "application/json",
#         "Authorization": "Basic ",
#     }

#     response = requests.request("GET", url, headers=headers)
#     print(
#         json.dumps(
#             json.loads(response.text), sort_keys=True, indent=4, separators=(",", ": ")
#         )
#     )
#     return JsonResponse({"message": "complete"})


# @csrf_exempt
# def get_jira_request_types(request: str) -> JsonResponse:
#     url = "https://balancer.atlassian.net/rest/servicedeskapi/servicedesk/2/requesttype"

#     headers = {"Accept": "application/json", "Authorization": "Basic "}

#     response = requests.request("GET", url, headers=headers)

#     print(
#         json.dumps(
#             json.loads(response.text), sort_keys=True, indent=4, separators=(",", ": ")
#         )
#     )
#     return JsonResponse({"message": "complete"})

# @csrf_exempt
# def get_required_request_type_fields(request: str) -> JsonResponse:
#     url = "https://balancer.atlassian.net/rest/servicedeskapi/servicedesk/2/requesttype/33/field"

#     headers = {
#         "Accept": "application/json",
#         "Content-Type": "application/json",
#         "Authorization": "Basic "
#     }

#     response = requests.request("GET", url, headers=headers)
#     print(json.dumps(json.loads(response.text), sort_keys=True, indent=4, separators=(",", ": ")))
#     return JsonResponse({"message": "complete"})
