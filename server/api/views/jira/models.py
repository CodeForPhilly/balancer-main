from django.db import models


class Feedback(models.Model):
    feedbacktype = models.CharField(max_length=100)

    def __str__(self):
        return self.feedbacktype
