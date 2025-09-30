from django.db import models
from ..views.listMeds.models import Medication
from ..models.model_embeddings import Embeddings


class MedRule(models.Model):
    RULE_TYPE_CHOICES = [
        ('INCLUDE', 'Include'),
        ('EXCLUDE', 'Exclude'),
    ]
    rule_type = models.CharField(max_length=7, choices=RULE_TYPE_CHOICES)
    history_type = models.CharField(max_length=255)
    reason = models.TextField(blank=True, null=True)
    label = models.CharField(max_length=255, blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    medications = models.ManyToManyField(
        Medication,
        related_name='med_rules'
    )
    sources = models.ManyToManyField(
        Embeddings,
        related_name='med_rules',
        blank=True,
        through='api.MedRuleSource'
    )

    class Meta:
        db_table = 'api_medrule'
        unique_together = [('rule_type', 'history_type')]

    def __str__(self):
        return f"{self.rule_type} - {self.label or 'Unnamed'}"


class MedRuleSource(models.Model):
    medrule = models.ForeignKey('api.MedRule', on_delete=models.CASCADE)
    embedding = models.ForeignKey('api.Embeddings', on_delete=models.CASCADE)
    medication = models.ForeignKey('api.Medication', on_delete=models.CASCADE)

    class Meta:
        db_table = 'api_medrule_sources'
        unique_together = [('medrule', 'embedding', 'medication')]

    def __str__(self):
        return f"Rule {self.medrule_id} | Embedding {self.embedding_id} | Medication {self.medication_id}"
