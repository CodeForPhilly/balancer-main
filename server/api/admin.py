from django.contrib import admin
from .views.listMeds.models import StateMedication


@admin.register(StateMedication)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['state', 'high_med', 'medium_med', 'low_med']
