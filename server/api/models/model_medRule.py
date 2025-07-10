from django.db import models
from ..views.listMeds.models import Medication
from ..models.model_embeddings import Embeddings


class MedRule(models.Model):
    rule_type = models.CharField(
        max_length=7,
        choices=[('INCLUDE', 'Include'), ('EXCLUDE', 'Exclude')]
    )
    history_type = models.CharField(max_length=255)
    reason = models.TextField(blank=True, null=True)
    label = models.CharField(max_length=255, blank=True, null=True)
    medications = models.ManyToManyField(Medication, related_name='med_rules')
    sources = models.ManyToManyField(
        Embeddings,
        related_name='med_rules',
        blank=True
    )
    explanation = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'api_medrule'
        unique_together = ['rule_type', 'history_type']

    def __str__(self):
        return f"{self.rule_type} - {self.label}"
