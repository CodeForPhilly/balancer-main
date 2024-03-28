from django.db import models

class Medication(models.Model):
    """
    name: name of the medication (ex: Lithium) or combination of medications (Quetiapine plus Lithium)
    benefits: 5 or benefits of the med or the combination, separated by commas
    risks: similar to benefits
    """
    name = models.CharField(max_length=29)
    benefits = models.CharField(max_length=1000)
    risks = models.CharField(max_length=1000)

    def __str__(self):
        return self.name

class Diagnosis(models.Model):
    state = models.CharField(max_length=29)
    medication_suggestion = models.ManyToManyField(Medication, through='Suggestion')
    
    def __str__(self):
        return self.state

class Suggestion(models.Model):
    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    tier = models.PositiveIntegerField(default=3)

    def __str__(self):
        return f'diagnosis {self.diagnosis}, tier {self.tier}, {self.medication}'
