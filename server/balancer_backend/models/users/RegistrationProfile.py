from django.db import models
from django.contrib.auth.models import User

class RegistrationProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    activation_key = models.CharField(max_length=40)

    def save(self, *args, **kwargs):
        # Generate a unique activation key when saving the model
        if not self.activation_key:
            self.activation_key = self.generate_activation_key()
        super(RegistrationProfile, self).save(*args, **kwargs)

    def generate_activation_key(self):
        # Implement a function to generate a unique activation key (you may use a library like uuid)
        # This is a simple example, you may want to customize this based on your requirements
        import uuid
        return str(uuid.uuid4())
