import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a default superuser'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        if not User.objects.filter(email='admin@example.com').exists():
            password = os.environ.get("SUPER_USER_PASSWORD", "adminpassword")
            User.objects.create_superuser(
                email='admin@example.com', password=password)
            self.stdout.write(self.style.SUCCESS(
                'Successfully created a new superuser'))
        else:
            self.stdout.write(self.style.SUCCESS(
                'Superuser already exists. Skipping.'))
