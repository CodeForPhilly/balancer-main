from django.urls import path
from api.views.login.views import CustomLogin
from api.views.login import views
from allauth.account import views as allauth_views

urlpatterns = [
    path("accounts/signup/", CustomLogin.as_view(), name="account_signup"),
    path("accounts/login/", views.custom_login, name="custom_login"),
]
