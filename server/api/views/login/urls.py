from django.urls import path
from api.views.login.views import CustomLogin, TestCSRF
from allauth.account import views as allauth_views

urlpatterns = [
    path("accounts/signup/", allauth_views.signup, name="account_signup"),
    path("accounts/login/", CustomLogin.as_view(), name="custom_login"),
    path("accounts/csrf/", TestCSRF.as_view(), name="csrf")
]
