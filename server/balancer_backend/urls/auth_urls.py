from django.urls import path
from user_management import views

urlpatterns = [
    path("auth/register_user/", views.register_user, name="register_user"),
    path("auth/activate/<str:activation_key>/", views.activate_account, name="activate_account")
] 
