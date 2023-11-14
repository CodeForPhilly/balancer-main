from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import status
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import RegistrationProfile
import requests
import json 
import os

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def send_verification_email(user):
    subject = 'Activate Your Account'
    activation_key = user.registrationprofile.activation_key
    message = render_to_string('email/verification_email.html', {'activation_key': activation_key, 'user': user})
    plain_message = strip_tags(message)  # This is the plain text version of the HTML content

    send_mail(subject, plain_message, 'your_email@example.com', [user.email], html_message=message)

@csrf_exempt
def register_user(request: str) -> JsonResponse:
    data: dict[str, str] = json.loads(request.body)
    email: str = data["email"]
    password: str = data["password"]

    if not email or not password:
        return JsonResponse({"error": "Email and password are required."})

    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email is already registered."})
    
    user = User.objects.create_user(email, email, password)
    user.is_active = False
    user.save()

    # Create the RegistrationProfile for the user
    registration_profile = RegistrationProfile.objects.create(user=user)

    send_verification_email(user)  # Make sure this function sends the verification email

    return JsonResponse({"message": "Registration successful. Check your email for verification."})

@csrf_exempt
def activate_account(request, activation_key):
    user = RegistrationProfile.objects.activate_user(activation_key)

    if user:
        return JsonResponse({"message": "Account activated successfully."})
    else:
        return JsonResponse({"error": "Invalid or expired activation key."})
