from django.contrib import admin
from .views.listMeds.models import StateMedication


@admin.register(StateMedication)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['state', 'first', 'second', 'third']
