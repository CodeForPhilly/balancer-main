import uuid

from django.db import models
from django.conf import settings

class SemanticSearchUsage(models.Model):
    """
    Tracks performance metrics and usage data for embedding searches.
    """
    guid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    query_text = models.TextField(blank=True, null=True, help_text="The search query text")
    document_name = models.TextField(blank=True, null=True, help_text="Document name filter if used")
    document_guid = models.UUIDField(blank=True, null=True, help_text="Document GUID filter if used")
    num_results_requested = models.IntegerField(default=10, help_text="Number of results requested")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='semantic_searches',
        null=True,
        blank=True,
        help_text="User who performed the search (null for unauthenticated users)"
    )
    encoding_time = models.FloatField(help_text="Time to encode query in seconds")
    db_query_time = models.FloatField(help_text="Time for database query in seconds")
    num_results_returned = models.IntegerField(help_text="Number of results returned")
    min_distance = models.FloatField(null=True, blank=True, help_text="Minimum L2 distance (null if no results)")
    max_distance = models.FloatField(null=True, blank=True, help_text="Maximum L2 distance (null if no results)")
    median_distance = models.FloatField(null=True, blank=True, help_text="Median L2 distance (null if no results)")


    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        total_time = self.encoding_time + self.db_query_time
        user_display = self.user.email if self.user else "Anonymous"
        return f"Search by {user_display} at {self.timestamp} ({total_time:.3f}s)"
