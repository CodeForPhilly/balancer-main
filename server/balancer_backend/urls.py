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
    "version",
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

import os
from django.conf import settings
from django.http import HttpResponseNotFound


def spa_fallback(request):
    """Serve index.html for SPA routing when build is present; otherwise 404."""
    index_path = os.path.join(settings.BASE_DIR, "build", "index.html")
    if os.path.exists(index_path):
        return TemplateView.as_view(template_name="index.html")(request)
    return HttpResponseNotFound()


# Always register SPA catch-all so production serves the frontend regardless of
# URL config load order. At request time we serve index.html if build exists, else 404.
urlpatterns += [
    re_path(r"^(?!api|admin|static).*$", spa_fallback),
]
