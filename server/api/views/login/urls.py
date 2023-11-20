from django.urls import path
from api.views.login import views
from allauth.account import views as allauth_views

urlpatterns = [
    path("accounts/signup/", allauth_views.signup, name="account_signup"),
    path("accounts/login/", views.custom_login, name="custom_login"),
    path("auth/csrf/", views.get_csrf, name="get_csrf"),
]
