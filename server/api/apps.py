from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        
        try:
            import os
            import sys
    
            # ready() runs in every Django process: migrate, test, shell, runserver, etc.
            # Only preload the model when we're actually going to serve requests.
            # Dev (docker-compose.yml) runs `manage.py runserver 0.0.0.0:8000`.
            # Prod (Dockerfile.prod CMD) runs `manage.py runserver 0.0.0.0:8000 --noreload`.
            # entrypoint.prod.sh also runs migrate, createsu, and populatedb before exec'ing
            # runserver — the guard below correctly skips model loading for those commands too.
            if sys.argv[1:2] != ['runserver']:
                return
    
            # Dev's autoreloader spawns two processes: a parent file-watcher and a child
            # server. ready() runs in both, but only the child (RUN_MAIN=true) serves
            # requests. Skip the parent to avoid loading the model twice on each file change.
            # Prod uses --noreload so RUN_MAIN is never set; 'noreload' in sys.argv handles that case.
            if os.environ.get('RUN_MAIN') != 'true' and '--noreload' not in sys.argv:
                return
    
            # Note: paraphrase-MiniLM-L6-v2 (~80MB) is downloaded from HuggingFace on first
            # use and cached to ~/.cache/torch/sentence_transformers/ inside the container.
            # That cache is ephemeral — every container rebuild re-downloads the model unless
            # a volume is mounted at that path.
            from .services.sentencetTransformer_model import TransformerModel
            TransformerModel.get_instance()
        except Exception:
            # TransformerModel._instance stays None on failure, so the first actual request 
            # that calls get_instance() will attempt to load the model again.
            import logging
            logger = logging.getLogger(__name__)
            logger.exception("Failed to preload the embedding model at startup")
