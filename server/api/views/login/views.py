from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login
from datetime import datetime
import json

def custom_login(request: str) -> JsonResponse:
    if request.method == 'POST':
        data: dict[str, str] = json.loads(request.body)
        email: str = data.get("email")
        password: str = data.get("password")

        user: User = User.objects.filter(email=email).first()

        if user and check_password(password, user.password):
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')

            refresh = RefreshToken.for_user(user)

            return JsonResponse({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'access_token_lifetime': datetime.utcfromtimestamp(refresh.access_token['exp']),
                'refresh_token_lifetime': datetime.utcfromtimestamp(refresh['exp'])
            })
        else:
            return JsonResponse({'message': 'Invalid credentials'}, status=401)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)