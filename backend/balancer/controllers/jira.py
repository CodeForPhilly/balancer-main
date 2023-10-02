from django.http import JsonResponse
import requests
import json
import os

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def create_new_feedback(request: str) -> JsonResponse:

    token: str = os.environ.get("JIRA_API_KEY")

    data: dict[str, str] = json.loads(request.body)
    name: str = data["name"]
    email: str = data["email"]
    message: str = data["message"]

    url: str = "https://balancer.atlassian.net/rest/servicedeskapi/request"

    headers: dict[str, str] = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Basic {token}"
    }

    payload: str = json.dumps({
        "requestFieldValues": {
            "summary": f"{name} - Feedback",
            "customfield_10061": email,
            "description": message
        },
        "requestTypeId": "33",
        "serviceDeskId": "2",
    })

    response: requests.Response = requests.request("POST", url, data=payload, headers=headers)
    match response.status_code:
        case 201:
            return JsonResponse({"status": 201,"message": "feedback submitted"})
        case 400:
            return JsonResponse({"status": 400,"message": "Invalid request"})
        case 401 | 403:
            return JsonResponse({"status": 401,"message": "Unauthorized request"})
        case _:
            return JsonResponse({"status": 500,"message": "Internal server error"})



    # if response.status_code == 201:
    #     return JsonResponse({"message": "feedback submitted"})
    # elif (response.status_code >= 400) and (response.status_code < 500):
    #     return JsonResponse({"message": "Unauthorized or invalid request"})
    


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
