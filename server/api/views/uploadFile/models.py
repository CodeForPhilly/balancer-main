from django.db import models
import uuid


class UploadFile(models.Model):
    guid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=255)
    file = models.BinaryField(null=True, editable=False)

    def __str__(self):
        return self.file_name
