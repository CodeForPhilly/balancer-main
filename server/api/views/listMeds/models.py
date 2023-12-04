from django.db import models


class StateMedication(models.Model):
    STATE_CHOICES = [
        ('manic', 'Manic'),
        ('hypomanic', 'Hypomanic'),
        ('depressed', 'Depressed'),
        ('euthymic', 'Euthymic'),
    ]

    MED_CHOICES = [
        ('manic-first', 'Risperidone, Olanzapine'),
        ('manic-second', 'Aripiprazole, Asenapine, Carbamazepine, Cariprazine, Lithium, Paliperidone, Quetiapine, Valproate, Ziprasidone'),
        ('manic-third', 'Haloperidol'),
        ('hypomanic-first', 'Risperidone, Olanzapine'),
        ('hypomanic-second', 'Aripiprazole, Asenapine, Carbamazepine, Cariprazine, Lithium, Paliperidone, Quetiapine, Valproate'),
        ('hypomanic-third', 'Haloperidol, Ziprasidone'),
        ('depressed-first', 'Quetiapine, Lurasidone'),
        ('depressed-second', 'Olanzapine plus Fluoxetine, Valproate (divalproex), Quetiapine plus Lithium, Quetiapine plus Valproate, Lurasidone plus Lithium, Lurasidone plus Valproate, Lithium plus Valproate, Lithium plus Lamotrigine'),
        ('depressed-third', 'Lamotrigine, Lithium, Olanzapine, Carbamazepine, Cariprazine, Olanzapine plus lithium, Olanzapine plus valproate'),
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
