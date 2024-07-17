from django.db import models


class Feedback(models.Model):
    ISSUE = 'issue'
    NEW_FEATURE = 'new_feature'
    GENERAL = 'general'
    
    FEEDBACK_TYPE_CHOICES = [
        (ISSUE, 'Issue'),
        (NEW_FEATURE, 'New Feature'),
        (GENERAL, 'General'),
    ]

    feedbacktype = models.CharField(max_length=100, choices=FEEDBACK_TYPE_CHOICES, default=GENERAL)
    name = models.CharField(max_length=100, default='')
    email = models.EmailField(default='')
    message = models.TextField(default='')

    def __str__(self):
        return self.name
