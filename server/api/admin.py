from django.contrib import admin
from .views.uploadFile.models import UploadFile
from .views.listMeds.models import StateMedication
from .models.authUser import UserAccount
from .views.ai_settings.models import AI_Settings
from .views.ai_promptStorage.models import AI_PromptStorage
from .views.ai_settings.models import AI_Settings
from .views.ai_promptStorage.models import AI_PromptStorage


@admin.register(StateMedication)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['state', 'first', 'second', 'third']


@admin.register(UploadFile)
class UploadFile(admin.ModelAdmin):
    list_display = ['guid', 'file_name', 'file']


@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'email', 'is_superuser']


@admin.register(AI_Settings)
class AI_Settings(admin.ModelAdmin):
    list_display = ['id', 'guid', 'SettingGUID', 'SettingValue']


@admin.register(AI_PromptStorage)
class AI_PromptStorage(admin.ModelAdmin):
    list_display = ['id', 'guid', 'PromptText', 'IsActive']
