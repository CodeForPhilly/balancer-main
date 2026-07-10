#!/usr/bin/env -S uv run --script
# /// script
# requires-python = "==3.11.11"
# dependencies = [
#   "pandas==2.2.3",
#   "openai",
#   "django",
# ]
# ///

# uv script (or plain Python) to generate results to CSV, run from the terminal
# Run from inside the container (working dir is /usr/src/server):
#   docker compose exec backend python api/views/assistant/eval_assistant.py
# 


import os
import sys
import logging
import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Django setup must come before any imports that touch the ORM
# NOTE: from api/views/assistant/, "../../../../" resolves four levels up to
# /usr/src (not /usr/src/server, where balancer_backend lives). So this insert
# alone does not put the settings package on sys.path — running the script
# relies on the container already having /usr/src/server on PYTHONPATH. Sanity-
# check this the first time the eval is run for real; the path depth may need
# adjusting (e.g. "../../../").
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "balancer_backend.settings")

import django
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from api.views.assistant.assistant_services import run_assistant  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Read model and INSTRUCTIONS from the source file or add a lightweight config endpoint to the backend

# Read model and INSTRUCTIONS from the source file
# INSTRUCTIONS is imported from assistant_prompts.py
# MODEL is read from assistant_services.py MODEL_DEFAULTS
# TODO: import a shared MODEL_NAME constant from assistant_services instead of hardcoding
MODEL = "gpt-5-nano"

# Set of representative questions to evaluate the assistant
QUESTIONS = [
    "What medications are recommended for bipolar depression?",
    "What are the risks of lithium for patients with kidney disease?",
    "Which mood stabilizers are safe during pregnancy?",
    "What is the evidence for quetiapine in bipolar disorder?",
    "How does valproate compare to lithium for mania?",
]


def run_one(question: str, user, branch: str) -> dict:
    """Run the assistant for a single question and return a result row.

    Uses ThreadPoolExecutor (not asyncio.gather + await run_assistant) for concurrency.

    Concurrency approach comparison:
    - ThreadPoolExecutor (this implementation):
        - run_assistant stays sync — views.py and the WSGI web app are unaffected
        - Each question runs in a thread pool worker, blocking on OpenAI + DB I/O
        - Django DB safe when run via `docker compose exec backend python eval_assistant.py`:
          this is a synchronous Django process context. Each ThreadPoolExecutor worker
          is a real OS thread with its own threading.local() storage, so each thread
          gets its own DB connection created lazily on first use. There is no shared
          event loop thread, so connections cannot clash or bleed between questions.
          The connection isolation concern only arises in ASGI contexts where multiple
          coroutines share one thread and therefore one threading.local() connection —
          which is not the case here.
        - Runtime: bottlenecked by OpenAI rate limits, not thread overhead
    - asyncio.gather + await run_assistant (alternative):
        - run_assistant becomes async — requires async def post in views.py,
          AsyncOpenAI client, and async handle_tool_calls_with_reasoning
        - Django DB unsafe if get_closest_embeddings is called directly in an async
          context without wrapping: get_closest_embeddings is a sync function that
          hits the ORM, so calling it on the event loop thread blocks all other
          coroutines until the DB responds. The fix is sync_to_async(get_closest_embeddings),
          which runs it in a dedicated worker thread with its own threading.local()
          connection. Bare await does not work at all — Django ORM querysets are not
          awaitables and raise TypeError immediately.
        - Under WSGI (manage.py runserver), async views run in a new event loop
          per request — adds overhead to every web request for no benefit
        - Cleaner call site in eval_assistant.py but wrong trade-off given WSGI
    """
    try:
        response_text, response_id = run_assistant(message=question, user=user)
        return {
            "branch": branch,
            "model": MODEL,
            "question": question,
            "response_output_text": response_text,
            "error": None,
        }
    except Exception as e:
        logger.error(f"Error evaluating question '{question}': {e}")
        return {
            "branch": branch,
            "model": MODEL,
            "question": question,
            "response_output_text": None,
            "error": str(e),
        }


def main():
    branch = os.environ.get("EVAL_BRANCH", "develop")

    User = get_user_model()
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        raise RuntimeError("No superuser found. Create one with manage.py createsuperuser.")

    logger.info(f"Starting evaluation: branch={branch}, model={MODEL}, questions={len(QUESTIONS)}")

    # ThreadPoolExecutor runs questions concurrently — see run_one docstring
    # for trade-off discussion vs asyncio.gather + await run_assistant.
    # max_workers=5 stays safely under OpenAI rate limits for gpt-5-nano.
    results = []
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {
            pool.submit(run_one, question, user, branch): question
            for question in QUESTIONS
        }
        for future in as_completed(futures):
            results.append(future.result())

    # Import pandas here, not at module top, so that importing this module (e.g.
    # run_one from test_eval_assistant.py) does not require pandas. It is only
    # needed for the CSV output below, when this script is run directly.
    import pandas as pd

    df = pd.DataFrame(results)

    results_dir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(results_dir, exist_ok=True)
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%S")
    output_path = os.path.join(results_dir, f"{branch}-{timestamp}.csv")
    df.to_csv(output_path, index=False)

    logger.info(f"Results saved to {output_path}")


if __name__ == "__main__":
    main()
