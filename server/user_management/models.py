from django.db import models
from registration.models import RegistrationProfile as BaseRegistrationProfile

class RegistrationProfile(BaseRegistrationProfile):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=40)
    # Other fields relevant for user registration and email verification

    def save(self, *args, **kwargs):
        if not self.activation_key:
            self.activation_key = self.generate_activation_key()
        super(RegistrationProfile, self).save(*args, **kwargs)

    def generate_activation_key(self):
        import uuid
        return str(uuid.uuid4())