from django.db import models
from django.utils import timezone
from django.models import UserAccount

class Chatlog(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    message = models.TextField()
    sent_by_user = models.BooleanField(default=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.sender.email} - {self.timestamp}"
