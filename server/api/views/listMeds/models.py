from django.db import models


class StateMedication(models.Model):
    STATE_CHOICES = [
        ('manic', 'Manic'),
        ('hypomanic', 'Hypomanic'),
        ('depressed', 'Depressed'),
        ('euthymic', 'Euthymic'),
    ]

    MED_CHOICES = [
        ('mania-first', 'Risperidone, Olanzapine'),
        ('mania-second', 'Aripiprazole, Asenapine, Carbamazepine, Cariprazine, Lithium, Paliperidone, Quetiapine, Valproate, Ziprasidone'),
        ('mania-third', 'Haloperidol'),
        ('hypomania-first', 'Risperidone, Olanzapine'),
        ('hypomania-second', 'Aripiprazole, Asenapine, Carbamazepine, Cariprazine, Lithium, Paliperidone, Quetiapine, Valproate'),
        ('hypomania-third', 'Haloperidol, Ziprasidone'),
        ('depression-first', 'Quetiapine, Lurasidone'),
        ('depression-second', 'Olanzapine plus Fluoxetine, Valproate (divalproex), Quetiapine plus Lithium, Quetiapine plus Valproate, Lurasidone plus Lithium, Lurasidone plus Valproate, Lithium plus Valproate, Lithium plus Lamotrigine'),
        ('depression-third', 'Lamotrigine, Lithium, Olanzapine, Carbamazepine, Cariprazine, Olanzapine plus lithium, Olanzapine plus valproate'),
        ('euthymic-first', 'Quetiapine'),
        ('euthymic-second', 'Lamotrigine, Lithium, Olanzapine plus Fluoxetine'),
        ('euthymic-third', 'Lurasidone, Citalopram, Escitalopram, Sertraline'),
    ]

    state = models.CharField(max_length=10, choices=STATE_CHOICES)
    first = models.CharField(max_length=100, choices=MED_CHOICES)
    second = models.CharField(max_length=100, choices=MED_CHOICES)
    third = models.CharField(max_length=100, choices=MED_CHOICES)

    def __str__(self):
        return self.state
