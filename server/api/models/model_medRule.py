from django.db import models
from ..views.listMeds.models import Medication


class MedRule(models.Model):
    """
    MedRule model represents the inclusion or exclusion of a medication based on specific medical history.
    """
    RULE_CHOICES = [
        ('INCLUDE', 'Include'),
        ('EXCLUDE', 'Exclude'),
    ]

    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    rule_type = models.CharField(max_length=7, choices=RULE_CHOICES)
    # e.g., kidneyHistory, liverHistory
    history_type = models.CharField(max_length=255)
    reason = models.TextField(blank=True, null=True)
    label = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f'{self.rule_type} {self.medication} for {self.history_type}'
