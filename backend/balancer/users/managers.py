from django.db.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, username=None, email=None, password=None, **extra_fields):
        super().create_user(username, email, password)
