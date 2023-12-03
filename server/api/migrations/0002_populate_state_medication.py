from django.db import migrations


def add_state_medication_data(apps, schema_editor):
    StateMedication = apps.get_model('api', 'StateMedication')

    # Define your data
    state_medication_data = [
        {'state': 'mania', 'first': 'mania-first',
            'second': 'mania-second', 'third': 'mania-third'},
        {'state': 'hypomanic', 'first': 'hypomanic-first',
         'second': 'hypomanic-second', 'third': 'hypomanic-third'},
        {'state': 'depressed', 'first': 'depressed-first',
         'second': 'depressed-second', 'third': 'depressed-third'},
        {'state': 'euthymic', 'first': 'euthymic-first',
                  'second': 'euthymic-second', 'third': 'euthymic-third'},
    ]

    # Insert the data into the StateMedication table
    for med in state_medication_data:
        StateMedication.objects.create(**med)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_state_medication_data),
    ]
