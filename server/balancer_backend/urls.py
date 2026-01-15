from django.contrib import admin  # Import Django's admin interface module

# Import functions for URL routing and including other URL configs
from django.urls import path, include, re_path

# Import TemplateView for rendering templates
from django.views.generic import TemplateView
import importlib  # Import the importlib module for dynamic module importing

# Define a list of URL patterns for the application
# Keep admin outside /api/ prefix
urlpatterns = [
    # Map 'admin/' URL to the Django admin interface
    path("admin/", admin.site.urls),
]

# List of application names for which URL patterns will be dynamically added
urls = [
    "conversations",
    "feedback",
    "listMeds",
    "risk",
    "uploadFile",
    "ai_promptStorage",
    "ai_settings",
    "embeddings",
    "medRules",
    "text_extraction",
    "assistant",
]

# Build API URL patterns to be included under /api/ prefix
api_urlpatterns = [
    # Include Djoser's URL patterns under 'auth/' for basic auth
    path("auth/", include("djoser.urls")),
    # Include Djoser's JWT auth URL patterns under 'auth/'
    path("auth/", include("djoser.urls.jwt")),
    # Include Djoser's social auth URL patterns under 'auth/'
    path("auth/", include("djoser.social.urls")),
]

# Loop through each application name and dynamically import and add its URL patterns
for url in urls:
    # Dynamically import the URL module for each app
    url_module = importlib.import_module(f"api.views.{url}.urls")
    # Append the URL patterns from each imported module
    api_urlpatterns += getattr(url_module, "urlpatterns", [])

# Wrap all API routes under /api/ prefix
urlpatterns += [
    path("api/", include(api_urlpatterns)),
]

# Add a catch-all URL pattern for handling SPA (Single Page Application) routing
# Serve 'index.html' for any unmatched URL (must come after /api/ routes)
urlpatterns += [
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]
