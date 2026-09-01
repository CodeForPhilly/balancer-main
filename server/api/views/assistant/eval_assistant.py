# Generates eval results to CSV. Run from inside the container:
# docker compose exec backend python api/views/assistant/eval_assistant.py
# Writes to results/ next to this file, which the ./server bind mount surfaces on the host.

import os
import sys
import csv
import json
import logging
import datetime
from dataclasses import asdict
from time import perf_counter
from concurrent.futures import ThreadPoolExecutor, as_completed

# Django setup must come before any imports that touch the ORM.
# Three levels up from api/views/assistant/ is /usr/src/server, where the balancer_backend settings package lives.
# Running a script file puts the *script's* directory on sys.path[0], not the working
# directory, and the image sets no PYTHONPATH — so without it django.setup() below
# raises ModuleNotFoundError on balancer_backend.settings.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "balancer_backend.settings")

import django
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from api.views.assistant.assistant_services import run_assistant, MODEL_NAME # noqa: E402
from api.views.assistant.assistant_types import ToolCallStatus
# Imported to warm the embedding model in main() before the worker pool starts —
# see the call site for why this process needs it and the web path does not.
from api.services.sentencetTransformer_model import TransformerModel  # noqa: E402


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

FIELDNAMES = [
    "branch",
    "model",
    "question",
    "response_output_text",
    "response_id",
    "tools_called",
    "tool_call_count",
    "tool_error_count",
    "tool_calls_json",
    # TODO: add turn_count, the five token columns, and turns_json here and to *both* run_one row literals
    "duration_s",
    "error",
]

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

    Uses ThreadPoolExecutor for concurrency.

    """
    # Time the full run_assistant call here rather than inside it: run_one already
    # owns the whole call, so wall-clock duration needs no plumbing through the
    # production code path (see AgentResult — duration is not carried).
    start = perf_counter()
    try:
        result = run_assistant(message=question, user=user)
        duration_s = perf_counter() - start
        tool_error_count = sum(
            1 for c in result.tool_calls if c.status is not ToolCallStatus.OK
        )
        return {
            "branch": branch,
            "model": MODEL_NAME,
            "question": question,
            "response_output_text": result.output_text,
            "response_id": result.response_id,
            # Flat summaries for at-a-glance scanning; the swallowed-failure hole this
            # closes shows up as tool_error_count > 0 while error is None.
            "tools_called": "|".join(c.name for c in result.tool_calls),
            "tool_call_count": len(result.tool_calls),
            "tool_error_count": tool_error_count,
            # Full per-call detail — status, the model's arguments (query), output/error — 
            # for analysis that the flat columns can't hold.
            "tool_calls_json": json.dumps([asdict(c) for c in result.tool_calls]),
            # TODO: turn_count = len(result.turns), token totals = sums over result.turns, turns_json = the asdict list
            "duration_s": duration_s,
            "error": None,
        }
    except Exception as e:
        duration_s = perf_counter() - start
        logger.error(f"Error evaluating question '{question}': {e}")
        return {
            "branch": branch,
            "model": MODEL_NAME,
            "question": question,
            "response_output_text": None,
            "response_id": None,
            "tools_called": "",
            "tool_call_count": 0,
            "tool_error_count": 0,
            "tool_calls_json": None,
            # TODO: turn_count 0, token totals 0, turns_json None — inherits tool_call_count's known lie (mid-loop failure hole)
            "duration_s": duration_s,
            "error": str(e),
        }


def main():
    branch = os.environ.get("EVAL_BRANCH", "develop")

    User = get_user_model()
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        raise RuntimeError("No superuser found. Create one with manage.py createsuperuser.")

    logger.info(f"Starting evaluation: branch={branch}, model={MODEL_NAME}, questions={len(QUESTIONS)}")

    # Load the embedding model before starting any workers
    TransformerModel.get_instance()

    # ThreadPoolExecutor runs questions concurrently
    # max_workers=5 stays safely under OpenAI rate limits for MODEL_NAME.
    results = []
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {
            pool.submit(run_one, question, user, branch): question
            for question in QUESTIONS
        }
        for future in as_completed(futures):
            results.append(future.result())


    results_dir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(results_dir, exist_ok=True)
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%S")
    output_path = os.path.join(results_dir, f"{branch}-{timestamp}.csv")

    # pandas was never in the backend image's requirements.txt
    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(results)

    logger.info(f"Results saved to {output_path}")


if __name__ == "__main__":
    main()
