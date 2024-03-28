from django.db import models
import uuid


class UploadFile(models.Model):
    id = models.AutoField(primary_key=True)
    guid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=255)
    file = models.BinaryField()
    date_of_upload = models.DateTimeField(auto_now_add=True)
    size = models.BigIntegerField()
    page_count = models.IntegerField()
    file_type = models.CharField(max_length=50)
    uploaded_by = models.CharField(max_length=255, blank=True, null=True)
    source_url = models.CharField(max_length=255, blank=True, null=True)
    analyzed = models.DateTimeField(blank=True, null=True)
    approved = models.DateTimeField(blank=True, null=True)
