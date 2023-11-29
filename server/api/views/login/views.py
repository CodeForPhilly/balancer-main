from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
import json

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class CustomLogin(APIView):

    @csrf_exempt
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = User.objects.filter(email=email).first()

        if user and check_password(password, user.password):
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "access_token_lifetime": datetime.utcfromtimestamp(
                        refresh.access_token["exp"]
                    ),
                    "refresh_token_lifetime": datetime.utcfromtimestamp(refresh["exp"]),
                },
                status=HTTP_200_OK
            )
        else:
            return Response({"message": "Invalid credentials"}, status=HTTP_401_UNAUTHORIZED)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class TestCSRF(APIView):
    
    def get(self, request):
        return Response({"message": "This is a test"})