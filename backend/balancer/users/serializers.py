from django.contrib.auth import get_user_model
from djoser.conf import settings as djoser_settings
from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
from django.db import IntegrityError
from rest_framework import serializers

User = get_user_model()


class UserCreateSerializer(DjoserUserCreateSerializer):
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User

    def validate(self, attrs):
        if "username" not in attrs:  # optional field due to email preference
            attrs["username"] = attrs["email"]

        return super().validate(attrs)
