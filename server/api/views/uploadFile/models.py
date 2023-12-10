from django.db import models
import uuid

class uploadFile(models.Model):
    guid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')

    def __str__(self):
        return self.file_name