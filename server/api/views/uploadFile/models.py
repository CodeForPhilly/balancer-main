from django.db import models
from django.conf import settings
import uuid


class UploadFile(models.Model):
    id = models.AutoField(primary_key=True)
    guid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    publication = models.CharField(max_length=255)
    publication_date = models.DateTimeField(blank=True)
    file = models.BinaryField(null=True)
    date_of_upload = models.DateTimeField(auto_now_add=True, blank=True)
    size = models.BigIntegerField()
    page_count = models.IntegerField()
    file_type = models.CharField(max_length=50)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_by_email = models.CharField(max_length=255, blank=True)
    source_url = models.CharField(max_length=255, blank=True, null=True)
    analyzed = models.DateTimeField(blank=True, null=True)
    approved = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.file_name
