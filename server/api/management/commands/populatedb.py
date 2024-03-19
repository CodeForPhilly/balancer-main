from django.core.management.base import BaseCommand
from api.views.listMeds.models import Medication, Diagnosis, Suggestion

MEDICATIONS = [
    [
        'Lithium',
        'Stabilizes mood swings, Reduces manic episodes, Prevents future episodes, Decreases suicide risk, Effective long-term treatment', 
        'Kidney problems, Thyroid issues, Weight gain, Tremors, Dehydration'
    ], 
    [
        'Lurasidone',
        'Treats manic and depressive episodes, Fewer metabolic side effects, Improves mood stability, May enhance cognition, Once-daily dosing', 
        'Risk of akathisia, May cause weight gain, Potential for sedation, Increased risk of suicidal thoughts, Possible EPS symptoms'
    ],
    [
        'Paliperidone', 
        'Stabilizes mood swings, Reduces manic symptoms, Decreases depressive episodes, Improves quality of life, Long-acting formulation available', 
        'Weight gain, Increased risk of diabetes, Elevated cholesterol levels, Sedation or drowsiness, Movement disorders'
    ],
    [
        'Quetiapine plus Lithium',
        'Mood stabilization, Reduced manic episodes, Improved sleep, Decreased risk of relapse, May manage depressive symptoms', 
        'Weight gain, Sedation, Risk of diabetes, Hormonal changes, Potential for tremors'
    ],
    [
        'Cariprazine', 
        'Mood stabilization, Reduced manic episodes, Decreased depressive symptoms, Improved overall functioning, Lower risk of relapse',
        'Weight gain, Sedation, Risk of akathisia, Increased lipid levels, Potential for metabolic side effects'
    ],
    [
        'Lithium plus Valproate', 
        'Mood stabilization, Reduced manic episodes, Combats depressive symptoms, Long-term effectiveness, Decreased risk of suicide',
        'Weight gain, Kidney problems, Thyroid issues, Liver damage, Potential birth defects'
    ],
    [
        'Citalopram',
        'May improve mood and reduce depression symptoms, Can help regulate sleep patterns, May increase energy levels, Generally well-tolerated, Can enhance quality of life',
        'Risk of manic episodes, Potential for increased suicidal thoughts, May cause agitation or restlessness, Possible sexual side effects, Can lead to serotonin syndrome'
    ],
    [
        'Quetiapine', 
        'Stabilizes mood, Reduces manic symptoms, Improves sleep, Decreases depressive episodes, Helps with anxiety', 
        'Weight gain, Sedation, Metabolic changes, Dizziness, Potential for diabetes'
    ],
    [
        'Aripiprazole',
        'Treats mania and mixed episodes, Improves mood stability, Reduces risk of relapse, Fewer metabolic side effects, May enhance cognitive function',
        'Weight gain possible, Risk of akathisia, May cause sedation, Potential for hyperglycemia, Increased risk of tremors'
    ],
    [
        'Olanzapine',
        'Stabilizes mood swings, Reduces manic symptoms, Treats psychotic features, Improves quality of life, Helps with sleep',
        'Weight gain, Metabolic issues, Sedation, Diabetes risk, Elevated cholesterol'
    ],
    [
        'Valproate (divalproex)', 
        'Mood stabilization, Reduces manic episodes, Decreases irritability, Helps with anxiety, Reduces aggression',
        'Liver damage, Weight gain, Pancreatitis, Birth defects, Sedation phase'
    ],
    [
        'Valproate', 
        'Stabilizes mood swings, Reduces manic episodes, Prevents future mood episodes, Eases symptoms of mania, Can be used long-term', 
        'Weight gain, Liver damage, Birth defects, Pancreatitis risk, Sedation and dizziness'
    ],
    [
        'Asenapine', 
        'Mood stabilization, Decreased mania symptoms, Improved sleep, Reduced agitation, Reduced risk of relapse', 
        'Weight gain, Sedation, Increased glucose levels, Extrapyramidal symptoms, Risk of akathisia'
    ],
    [
        'Sertraline',
        'Mood stabilization, Improved sleep, Reduced depression symptoms, Enhances overall well-being, Decreased anxiety levels',
        'Risk of manic episodes, Sexual dysfunction, Potential weight gain, Increased suicidal thoughts, Serotonin syndrome'
    ],
    [
        'Carbamazepine', 
        'Stabilizes mood swings, Reduces manic episodes, Low risk of weight gain, Decreases risk of suicide, Helps with irritability and aggression',
        'Risk of liver damage, May cause dizziness, Interacts with many medications, Monitoring blood counts necessary, Skin reactions possible'
    ],
    [
        'Lurasidone plus Lithium',
        'Dual action for mood stabilization, Reduced risk of manic episodes, May improve depressive symptoms, Effective in treating Bipolar disorder, Fewer side effects compared to other medications',
        'Potential for weight gain, Risk of lithium toxicity, Possible hormonal imbalances, Increased risk of diabetes, Adverse effects on the liver'
    ],
    [
        'Lithium plus Lamotrigine', 
        'Mood stabilization, Reduces manic episodes, Decreases depressive symptoms, Long-term efficacy, Combination therapy option',
        'Kidney problems, Thyroid issues, Risk of toxicity, Cognitive side effects, Skin reactions'
    ],
    [
        'Olanzapine plus Lithium',
        'Mood stabilization, Reduced manic episodes, Decreased depressive symptoms, Improved quality of life, Effective in treating bipolar disorder',
        'Weight gain, Sedation, Metabolic side effects, Increased cholesterol levels, Kidney problems'
    ],
    [
        'Ziprasidone', 
        'Treats manic and depressive episodes, Helps improve mood stability, Fewer metabolic side effects, Low risk of weight gain, Can be taken with or without food', 
        'May cause dizziness or fainting, Risk of sedation and drowsiness, Potential for abnormal heart rhythms, Increased risk of type 2 diabetes, Possible increase in cholesterol levels'
    ],
    [
        'Haloperidol', 
        'Mania control, Psychosis relief, Agitation reduction, Improved sleep, Rapid symptom relief', 
        'Tardive dyskinesia, Neurological side effects, Sedation, Weight gain, Cardiac issues'
    ],
    [
        'Olanzapine plus Fluoxetine',
        'Mood stabilization, Decreased depressive symptoms, Improved quality of life, Reduced risk of relapse, Symptom management',
        'Weight gain, Diabetes risk, Sedation, Movement disorders, Cardiovascular effects'
    ],
    [
        'Risperidone',
        'Stabilizes mood swings, Reduces manic episodes, Helps manage psychosis, Relieves agitation and aggression, Improves sleep patterns',
        'Weight gain, Increased risk of diabetes, Sedation and drowsiness, Elevated prolactin levels, Potential for movement disorders'
    ],
    [
        'Lamotrigine',
        'Mood stabilization, Decreased risk of mania, Reduced depressive episodes, Fewer bipolar symptoms, Improves quality of life',
        'Skin rash (serious), Dizziness and drowsiness, Cognitive impairment, Affects vision, Risk of suicidal thoughts'
    ],
    [
        'Lurasidone plus Valproate',
        'Dual action for stabilizing moods, Potential for improved symptom management, May enhance effectiveness compared to monotherapy, Combination approach targeting different pathways, Less risk of treatment resistance',
        ' Increased potential for side effects, Possible drug interactions, Greater risk of adverse reactions, Higher medication burden, Monitoring required for drug levels'
    ],
    [
        'Escitalopram',
        'Improves mood, Reduces anxiety, Helps with depression, May enhance overall well-being, Easy to take (typically once daily)',
        'Risk of manic episodes, Potential for serotonin syndrome, May cause weight changes, Withdrawal symptoms, Increased suicidal thoughts (especially at start)'
    ],
    [
        'Olanzapine plus Valproate',
        'Treats mania symptoms, Mood stabilization, Decreases risk of relapse, Improves overall functioning, Reduces depressive episodes',
        'Weight gain, Sedation, Metabolic issues, Liver toxicity, Cognitive side effects'
    ],
    [
        'Quetiapine plus Valproate',
        'Stabilizes mood swings, Reduces manic episodes, Decreases depressive symptoms, Improves sleep patterns, Enhances overall quality of life',
        'Weight gain, Sedation, Increased risk of diabetes, Liver function abnormalities, Potential for birth defects'
    ]
]

MED_CHOICES = {
    'Manic': [
        'Risperidone, Olanzapine',
        'Aripiprazole, Asenapine, Carbamazepine, Cariprazine, Lithium, Paliperidone, Quetiapine, Valproate, Ziprasidone',
        'Haloperidol'
    ],
    'Hypomanic': [
        'Risperidone, Olanzapine',
        'Aripiprazole, Asenapine, Carbamazepine, Cariprazine, Lithium, Paliperidone, Quetiapine, Valproate',
        'Haloperidol, Ziprasidone'
    ],
    'Depressed': [
        'Quetiapine, Lurasidone',
        'Olanzapine plus Fluoxetine, Valproate (divalproex), Quetiapine plus Lithium, Quetiapine plus Valproate, Lurasidone plus Lithium, Lurasidone plus Valproate, Lithium plus Valproate, Lithium plus Lamotrigine',
        'Lamotrigine, Lithium, Olanzapine, Carbamazepine, Cariprazine, Olanzapine plus lithium, Olanzapine plus valproate'
    ],
    'Euthymic': [
        'Quetiapine',
        'Lamotrigine, Lithium, Olanzapine plus Fluoxetine',
        'Lurasidone, Citalopram, Escitalopram, Sertraline'
    ]
}

class Command(BaseCommand):
    help = 'Populate the DB after initialization'

    def handle(self, *args, **kwargs):
        if Medication.objects.all().count() > 0:
            return
        med_set = {}
        for med in MEDICATIONS:
            medication = Medication.objects.get_or_create(
                name=med[0],
                benefits=med[1],
                risks=med[2]
            )[0]
            med_set[med[0].lower()] = medication
        for state in MED_CHOICES:
            diagnosis = Diagnosis.objects.get_or_create(state=state)[0]
            for (i, options) in enumerate(MED_CHOICES[state]):
                option_list = [med.strip().lower() for med in options.split(",")]
                for med in option_list:
                    exist = Suggestion.objects.filter(diagnosis=diagnosis, medication=med_set[med]).count() > 0
                    if not exist:
                        Suggestion.objects.create(
                            diagnosis=diagnosis, 
                            medication=med_set[med], 
                            tier=(i+1)
                        )

