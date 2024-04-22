from django.db import models
import uuid


class UploadFile(models.Model):
    """Out of date version of model, don't use"""
    guid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=255)
    file = models.BinaryField(null=True, editable=False)

    def __str__(self):
        return self.file_name

class UploadedFile(models.Model):
    """Current version of model, use this one"""
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