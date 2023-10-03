from django.http import JsonResponse
from django import forms
import requests
import json
import os

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def create_new_feedback(request: str) -> JsonResponse:
    """
    Create a new feedback request in Jira Service Desk.
    """
    token: str = os.environ.get("JIRA_API_KEY")

    data: dict[str, str] = json.loads(request.body)
    name: str = data["name"]
    email: str = data["email"]
    message: str = data["message"]

    url: str = "https://balancer.atlassian.net/rest/servicedeskapi/request"

    headers: dict[str, str] = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Basic {token}",
    }

    payload: str = json.dumps(
        {
            "requestFieldValues": {
                "summary": f"{name} - Feedback",
                "customfield_10061": email,
                "description": message,
            },
            "requestTypeId": "33",
            "serviceDeskId": "2",
        }
    )

    response: requests.Response = requests.request(
        "POST", url, data=payload, headers=headers
    )
    match response.status_code:
        case 201:
            response_body: dict[str, str] = json.loads(response.text)
            issue_key: str = response_body["issueKey"]
            return JsonResponse(
                {"status": 201, "message": "Feedback submitted", "issueKey": issue_key}
            )
        case 400:
            return JsonResponse({"status": 400, "message": "Invalid request"})
        case 401 | 403:
            return JsonResponse({"status": 401, "message": "Unauthorized request"})
        case _:
            return JsonResponse({"status": 500, "message": "Internal server error"})


class UploadAttachmentForm(forms.Form):
    issueKey: forms.CharField = forms.CharField(max_length=50)
    attachment = forms.FileField()


@csrf_exempt
def upload_servicedesk_attachment(request: str) -> JsonResponse:
    """
    Upload file to temporary files in Jira Service Desk.
    """
    token: str = os.environ.get("JIRA_API_KEY")
    form: UploadAttachmentForm = UploadAttachmentForm(request.POST, request.FILES)
    if form.is_valid():
        url: str = f"https://balancer.atlassian.net/rest/servicedeskapi/servicedesk/2/attachTemporaryFile"

        headers: dict[str, str] = {
            "Accept": "application/json",
            "X-Atlassian-Token": "no-check",
            "Authorization": f"Basic {token}",
        }

        response: requests.Response = requests.request(
            "POST", url, files={"file": request.FILES["attachment"]}, headers=headers
        )
        match response.status_code:
            case 201:
                response_body: dict[str, str] = json.loads(response.text)
                temp_attachment_id: str = response_body["temporaryAttachments"][0][
                    "temporaryAttachmentId"
                ]
                issue_key: str = request.POST.get("issueKey")
                return JsonResponse(
                    {
                        "status": 200,
                        "message": "Attachment uploaded to temporary files",
                        "tempAttachmentId": temp_attachment_id,
                        "issueKey": issue_key,
                    }
                )
            case 400:
                return JsonResponse({"status": 400, "message": "Invalid request"})
            case 401 | 403:
                return JsonResponse({"status": 401, "message": "Unauthorized request"})
            case _:
                return JsonResponse({"status": 500, "message": "Internal server error"})
    return JsonResponse({"status": 400, "message": "Invalid form object"})


@csrf_exempt
def attach_feedback_attachment(request: str) -> JsonResponse:
    """
    Attach a temporary file to a Jira Service Desk issue.
    """
    token: str = os.environ.get("JIRA_API_KEY")
    data: dict[str, str] = json.loads(request.body)
    issue_key: str = data["issueKey"]
    temp_attachment_id: str = data["tempAttachmentId"]
    print(issue_key)

    url: str = f"https://balancer.atlassian.net/rest/servicedeskapi/request/{issue_key}/attachment"

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Basic {token}",
    }

    payload: str = json.dumps(
        {"public": True, "temporaryAttachmentIds": [temp_attachment_id]}
    )

    response: requests.Response = requests.request(
        "POST", url, data=payload, headers=headers
    )
    match response.status_code:
        case 201:
            return JsonResponse({"status": 201, "message": f"File attached to issue {issue_key}"})
        case 400:
            return JsonResponse({"status": 400, "message": "Invalid request"})
        case 401 | 403:
            return JsonResponse({"status": 401, "message": "Unauthorized request"})
        case _:
            return JsonResponse({"status": 500, "message": "Internal server error"})


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
