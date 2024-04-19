type MedData = {
  title: string;
  benefits: string;
  risks: string;
};

const medicationsInfo = [
  {
    title: 'Lithium',
    benefits: 'Stabilizes mood swings, Reduces manic episodes, Prevents future episodes, Decreases suicide risk, Effective long-term treatment', 
    risks: 'Kidney problems, Thyroid issues, Weight gain, Tremors, Dehydration'
  }, 
  {
    title: 'Lurasidone',
    benefits: 'Treats manic and depressive episodes, Fewer metabolic side effects, Improves mood stability, May enhance cognition, Once-daily dosing', 
    risks: 'Risk of akathisia, May cause weight gain, Potential for sedation, Increased risk of suicidal thoughts, Possible EPS symptoms'
  },
  {
    title: 'Paliperidone', 
    benefits: 'Stabilizes mood swings, Reduces manic symptoms, Decreases depressive episodes, Improves quality of life, Long-acting formulation available', 
    risks: 'Weight gain, Increased risk of diabetes, Elevated cholesterol levels, Sedation or drowsiness, Movement disorders'
  },
  {
    title: 'Quetiapine plus Lithium',
    benefits: 'Mood stabilization, Reduced manic episodes, Improved sleep, Decreased risk of relapse, May manage depressive symptoms', 
    risks: 'Weight gain, Sedation, Risk of diabetes, Hormonal changes, Potential for tremors'
  },
  {
    title: 'Cariprazine', 
    benefits: 'Mood stabilization, Reduced manic episodes, Decreased depressive symptoms, Improved overall functioning, Lower risk of relapse',
    risks: 'Weight gain, Sedation, Risk of akathisia, Increased lipid levels, Potential for metabolic side effects'
  },
  {
    title: 'Lithium plus Valproate', 
    benefits: 'Mood stabilization, Reduced manic episodes, Combats depressive symptoms, Long-term effectiveness, Decreased risk of suicide',
    risks: 'Weight gain, Kidney problems, Thyroid issues, Liver damage, Potential birth defects'
  },
  {
    title: 'Citalopram',
    benefits: 'May improve mood and reduce depression symptoms, Can help regulate sleep patterns, May increase energy levels, Generally well-tolerated, Can enhance quality of life',
    risks: 'Risk of manic episodes, Potential for increased suicidal thoughts, May cause agitation or restlessness, Possible sexual side effects, Can lead to serotonin syndrome'
  },
  {
    title: 'Quetiapine', 
    benefits: 'Stabilizes mood, Reduces manic symptoms, Improves sleep, Decreases depressive episodes, Helps with anxiety', 
    risks: 'Weight gain, Sedation, Metabolic changes, Dizziness, Potential for diabetes'
  },
  {
    title: 'Aripiprazole',
    benefits: 'Treats mania and mixed episodes, Improves mood stability, Reduces risk of relapse, Fewer metabolic side effects, May enhance cognitive function',
    risks: 'Weight gain possible, Risk of akathisia, May cause sedation, Potential for hyperglycemia, Increased risk of tremors'
  },
  {
    title: 'Olanzapine',
    benefits: 'Stabilizes mood swings, Reduces manic symptoms, Treats psychotic features, Improves quality of life, Helps with sleep',
    risks: 'Weight gain, Metabolic issues, Sedation, Diabetes risk, Elevated cholesterol'
  },
  {
    title: 'Valproate', 
    benefits: 'Stabilizes mood swings, Reduces manic episodes, Prevents future mood episodes, Eases symptoms of mania, Can be used long-term', 
    risks: 'Weight gain, Liver damage, Birth defects, Pancreatitis risk, Sedation and dizziness'
  },
  {
    title: 'Asenapine', 
    benefits: 'Mood stabilization, Decreased mania symptoms, Improved sleep, Reduced agitation, Reduced risk of relapse', 
    risks: 'Weight gain, Sedation, Increased glucose levels, Extrapyramidal symptoms, Risk of akathisia'
  },
  {
    title: 'Sertraline',
    benefits: 'Mood stabilization, Improved sleep, Reduced depression symptoms, Enhances overall well-being, Decreased anxiety levels',
    risks: 'Risk of manic episodes, Sexual dysfunction, Potential weight gain, Increased suicidal thoughts, Serotonin syndrome'
  },
  {
    title: 'Carbamazepine', 
    benefits: 'Stabilizes mood swings, Reduces manic episodes, Low risk of weight gain, Decreases risk of suicide, Helps with irritability and aggression',
    risks: 'Risk of liver damage, May cause dizziness, Interacts with many medications, Monitoring blood counts necessary, Skin reactions possible'
  },
  {
    title: 'Lurasidone plus Lithium',
    benefits: 'Dual action for mood stabilization, Reduced risk of manic episodes, May improve depressive symptoms, Effective in treating Bipolar disorder, Fewer side effects compared to other medications',
    risks: 'Potential for weight gain, Risk of lithium toxicity, Possible hormonal imbalances, Increased risk of diabetes, Adverse effects on the liver'
  },
  {
    title: 'Lithium plus Lamotrigine', 
    benefits: 'Mood stabilization, Reduces manic episodes, Decreases depressive symptoms, Long-term efficacy, Combination therapy option',
    risks: 'Kidney problems, Thyroid issues, Risk of toxicity, Cognitive side effects, Skin reactions'
  },
  {
    title: 'Olanzapine plus Lithium',
    benefits: 'Mood stabilization, Reduced manic episodes, Decreased depressive symptoms, Improved quality of life, Effective in treating bipolar disorder',
    risks: 'Weight gain, Sedation, Metabolic side effects, Increased cholesterol levels, Kidney problems'
  },
  {
    title: 'Ziprasidone', 
    benefits: 'Treats manic and depressive episodes, Helps improve mood stability, Fewer metabolic side effects, Low risk of weight gain, Can be taken with or without food', 
    risks: 'May cause dizziness or fainting, Risk of sedation and drowsiness, Potential for abnormal heart rhythms, Increased risk of type 2 diabetes, Possible increase in cholesterol levels'
  },
  {
    title: 'Haloperidol', 
    benefits: 'Mania control, Psychosis relief, Agitation reduction, Improved sleep, Rapid symptom relief', 
    risks: 'Tardive dyskinesia, Neurological side effects, Sedation, Weight gain, Cardiac issues'
  },
  {
    title: 'Olanzapine plus Fluoxetine',
    benefits: 'Mood stabilization, Decreased depressive symptoms, Improved quality of life, Reduced risk of relapse, Symptom management',
    risks: 'Weight gain, Diabetes risk, Sedation, Movement disorders, Cardiovascular effects'
  },
  {
    title: 'Risperidone',
    benefits: 'Stabilizes mood swings, Reduces manic episodes, Helps manage psychosis, Relieves agitation and aggression, Improves sleep patterns',
    risks: 'Weight gain, Increased risk of diabetes, Sedation and drowsiness, Elevated prolactin levels, Potential for movement disorders'
  },
  {
    title: 'Lamotrigine',
    benefits: 'Mood stabilization, Decreased risk of mania, Reduced depressive episodes, Fewer bipolar symptoms, Improves quality of life',
    risks: 'Skin rash (serious), Dizziness and drowsiness, Cognitive impairment, Affects vision, Risk of suicidal thoughts'
  },
  {
    title: 'Lurasidone plus Valproate',
    benefits: 'Dual action for stabilizing moods, Potential for improved symptom management, May enhance effectiveness compared to monotherapy, Combination approach targeting different pathways, Less risk of treatment resistance',
    risks: ' Increased potential for side effects, Possible drug interactions, Greater risk of adverse reactions, Higher medication burden, Monitoring required for drug levels'
  },
  {
    title: 'Escitalopram',
    benefits: 'Improves mood, Reduces anxiety, Helps with depression, May enhance overall well-being, Easy to take (typically once daily)',
    risks: 'Risk of manic episodes, Potential for serotonin syndrome, May cause weight changes, Withdrawal symptoms, Increased suicidal thoughts (especially at start)'
  },
  {
    title: 'Olanzapine plus Valproate',
    benefits: 'Treats mania symptoms, Mood stabilization, Decreases risk of relapse, Improves overall functioning, Reduces depressive episodes',
    risks: 'Weight gain, Sedation, Metabolic issues, Liver toxicity, Cognitive side effects'
  },
  {
    title: 'Quetiapine plus Valproate',
    benefits: 'Stabilizes mood swings, Reduces manic episodes, Decreases depressive symptoms, Improves sleep patterns, Enhances overall quality of life',
    risks: 'Weight gain, Sedation, Increased risk of diabetes, Liver function abnormalities, Potential for birth defects'
  }
]

export {type MedData, medicationsInfo}