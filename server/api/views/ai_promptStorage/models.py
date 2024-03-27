from django.db import models
from django.conf import settings
import uuid

PROMPT_AREAS = (
    ('system', 'System Prompt'),
    ('dashboard', 'Dashboard'),
    ('settings', 'Settings Page'),
)


class AI_PromptStorage(models.Model):
    guid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    PromptText = models.TextField()
    IsActive = models.BooleanField(default=True)
    Area = models.CharField(
        max_length=100, choices=PROMPT_AREAS, default='dashboard')
    CreatedAt = models.DateTimeField(auto_now_add=True)
    CreatedByUser = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prompts_created')
    LastModified = models.DateTimeField(auto_now=True)
    ModifiedByUser = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prompts_modified')

    def __str__(self):
        return f'Prompt {self.id}: {self.PromptText[:50]}...'

    class Meta:
        verbose_name_plural = "AI_PromptStorage"
