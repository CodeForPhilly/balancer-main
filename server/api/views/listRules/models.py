# Models: Define the data structure (usually corresponding to database tables).
from django.db import models # type: ignore
from listMeds.models import Medication
from ai.api.views.embeddings.models import Embeddings


class Rules(models.Model):

    RULE_TYPES = [ ('includes', 'excludes')]

    #id = models.CharField(max_length=29) 
    rule = models.CharField(max_length=1000)
    type = models.CharField(max_length=1000, choices=RULE_TYPES)

    def __str__(self):
        return self.rule


class Medication_Rules(models.Model):
    #id = models.CharField(max_length=29)
    rule_id = models.ForeignKey(Rules, on_delete=models.CASCADE)
    is_applicable = models.BooleanField(default=True)
    embeddings = models.ForeignKey(Embeddings, on_delete=models.CASCADE)
    medication_id = models.ForeignKey(Medication, on_delete=models.CASCADE)
    
    def __str__(self):
        return f'{self.rule_id} - {self.medication_id}'
