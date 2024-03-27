from django.urls import path
from api.views.ai_promptStorage import views

urlpatterns = [
    path("ai_promptStorage/storePrompt/",
         views.store_prompt, name="storePrompt"),

    path("ai_promptStorage/getAllPrompts/",
         views.get_all_prompts, name="getAllPrompts"),
]
