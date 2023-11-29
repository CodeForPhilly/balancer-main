from django.db import models


class StateMedication(models.Model):
    STATE_CHOICES = [
        ('hot', 'Hot'),
        ('low', 'Low'),
    ]

    MED_CHOICES = [
        ('high', 'High'),
        ('med', 'Medium'),
        ('low', 'Low'),
    ]

    state = models.CharField(max_length=10, choices=STATE_CHOICES)
    high_med = models.CharField(max_length=100, choices=MED_CHOICES)
    medium_med = models.CharField(max_length=100, choices=MED_CHOICES)
    low_med = models.CharField(max_length=100, choices=MED_CHOICES)

    def __str__(self):
        return self.state
