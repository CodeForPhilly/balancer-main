from django.contrib import admin
from .views.uploadFile.models import UploadFile
from .views.listMeds.models import Medication, Diagnosis, Suggestion
from .models.authUser import UserAccount
from .views.ai_settings.models import AI_Settings
from .views.ai_promptStorage.models import AI_PromptStorage
from .models.model_embeddings import Embeddings
from .views.feedback.models import Feedback
from .models.model_medRule import MedRule


@admin.register(MedRule)
class MedRuleAdmin(admin.ModelAdmin):
    list_display = ['rule_type', 'history_type', 'label']
    search_fields = ['label', 'history_type', 'reason']


@admin.register(Embeddings)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ['guid']


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):  # noqa: F811
    list_display = ['name', 'benefits', 'risks']


@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ['state']


@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ['diagnosis', 'medication', 'tier']


@admin.register(UploadFile)
class UploadFile(admin.ModelAdmin):
    list_display = ['guid', 'file_name', 'file']


@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'email', 'is_superuser']


@admin.register(AI_Settings)
class AI_Settings(admin.ModelAdmin):
    list_display = ['id', 'guid', 'SourceTableGUID', 'SettingValue']


@admin.register(AI_PromptStorage)
class AI_PromptStorage(admin.ModelAdmin):
    list_display = ['id', 'guid', 'PromptText', 'IsActive']


@admin.register(Feedback)
class Feedback(admin.ModelAdmin):
    list_display = ['feedbacktype', 'name', 'email', 'message']
