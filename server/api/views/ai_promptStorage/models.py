from django.db import models
from django.conf import settings
import uuid

PROMPT_AREAS = (
    ('system', 'System Prompt'),
    ('dashboard', 'Dashboard'),
    ('settings', 'Settings Page'),
)


class AI_PromptStorage(models.Model):
    """
    Database-backed storage for AI prompt overrides.

    Currently unused at runtime — prompts are managed as code constants in
    api.services.prompt_services. This model is intended to support runtime
    prompt editing (without a code deploy) when that becomes a requirement.

    Intended future use: a get_prompt() function in prompt_services.py queries
    this table first (filtered by Area and IsActive=True) and falls back to the
    code constant if no active record is found.

    NOTE: Before activating runtime use, the store_prompt endpoint needs its
    permission_classes restored (currently commented out in views.py).
    """

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
