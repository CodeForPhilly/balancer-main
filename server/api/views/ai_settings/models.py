from django.conf import settings
from django.db import models
import uuid


class AI_Settings(models.Model):
    guid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    SettingsLabel = models.CharField(max_length=255, null=True)
    SettingValue = models.TextField()
    SourceTable = models.TextField()
    SourceTableGUID = models.CharField(max_length=255, unique=True)
    LastModified = models.DateTimeField(auto_now=True)
    ModifiedByUser = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settings_modified')

    def __str__(self):
        return self.guid

    class Meta:
        verbose_name_plural = "AI_settings"
