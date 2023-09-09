"""
If you're starting a new project, it's highly recommended to set up a custom user model,
even if the default User model is sufficient for you. This model behaves identically to
the default user model, but you'll be able to customize it in the future if the need arises
"""
from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    # XXX: Justification, remove after review
    """
    If you’re starting a new project, it’s highly recommended to set up a custom user model, even if the default User model is sufficient for you.
    This model behaves identically to the default user model, but you’ll be able to customize it in the future if the need arises
    """
    REQUIRED_FIELDS = ["password"]

    email = models.EmailField(max_length=96, unique=True)
    is_active = models.BooleanField(default=True)
    username = models.CharField(max_length=96, null=True, blank=True, unique=True)

    USERNAME_FIELD = "email"
