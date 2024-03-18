from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
import importlib

urlpatterns = [
    path('admin/', admin.site.urls),
]


# List of application names for which URL patterns will be dynamically added
urls = ['embeddings']

# Loop through each application name and dynamically import and add its URL patterns
for url in urls:
    # Dynamically import the URL module for each app
    url_module = importlib.import_module(f'api.views.{url}.urls')
    # Append the URL patterns from each imported module
    urlpatterns += getattr(url_module, 'urlpatterns', [])

# Add a catch-all URL pattern for handling SPA (Single Page Application) routing
# Serve 'index.html' for any unmatched URL
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),]
