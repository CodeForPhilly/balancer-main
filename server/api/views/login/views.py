from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
import requests
import json

def custom_login(request: str) -> JsonResponse:
    if request.method == 'POST':
        data: dict[str, str] = json.loads(request.body)
        email: str = data["email"]
        password: str = data["password"]

        user = User.objects.get(email=email)

        if check_password(password, user.password):
            return JsonResponse({'message': 'success'})
        else:
            return JsonResponse({'message': 'fail'})