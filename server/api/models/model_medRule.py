from django.db import models
from ..views.listMeds.models import Medication
from django.db.models import CASCADE


class MedRule(models.Model):
    rule_type = models.CharField(
        max_length=7,
        choices=[('INCLUDE', 'Include'), ('EXCLUDE', 'Exclude')]
    )
    history_type = models.CharField(max_length=255)
    reason = models.TextField(blank=True, null=True)
    label = models.CharField(max_length=255, blank=True, null=True)
    medication = models.ForeignKey(Medication, on_delete=CASCADE)

    class Meta:
        db_table = 'api_medrule'  # specify the table name if needed
