from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_embeddings_publication_embeddings_publication_date_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='MedRuleSource',
            fields=[
                ('id', models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name='ID')),
                ('embedding', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, to='api.embeddings')),
                ('medication', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, to='api.medication')),
                ('medrule', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, to='api.medrule')),
            ],
            options={
                'db_table': 'api_medrule_sources',
                'unique_together': {('medrule', 'embedding', 'medication')},
            },
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterField(
                    model_name='medrule',
                    name='sources',
                    field=models.ManyToManyField(
                        blank=True,
                        related_name='med_rules',
                        through='api.MedRuleSource',
                        to='api.embeddings'
                    ),
                ),
                migrations.RemoveField(
                    model_name='medrule',
                    name='medications',
                ),
            ]
        ),
    ]
