from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
import importlib

urls = ['chatgpt', 'jira', 'listDrugs', 'listMeds', 'risk', 'login']

urlpatterns = [
    path("admin/", admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html')),
]

for url in urls:
    url_module = importlib.import_module(f'api.views.{url}.urls')
    urlpatterns += getattr(url_module, 'urlpatterns', [])

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])