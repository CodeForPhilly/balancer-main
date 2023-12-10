from django.contrib import admin
from .views.uploadFile.models import uploadFile
from .views.listMeds.models import StateMedication


@admin.register(StateMedication)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['state', 'first', 'second', 'third']

@admin.register(uploadFile)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['guid', 'file_name', 'file']
