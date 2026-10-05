# Generates eval results to CSV. Run from inside the container:
# docker compose exec -e EVAL_BRANCH=<branch> backend python api/views/assistant/eval_assistant.py
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
    "question",
    "error",
    "response_output_text",
    "duration_s",
    # No total_tokens column: it is total_input_tokens + total_output_tokens
    "total_input_tokens",
    "total_cached_input_tokens",
    "total_output_tokens",
    "total_reasoning_output_tokens",
    "total_tool_calls",
    "total_tool_errors",
    "tool_calls_json",
    "token_usages_json",
]

# Set of representative questions to evaluate the assistant

QUESTIONS = [
    "What medications are recommended for bipolar depression?",
    "What are the risks of lithium for patients with kidney disease?",
    "Which mood stabilizers are safe during pregnancy?",
    "What is the evidence for quetiapine in bipolar disorder?",
    "How does valproate compare to lithium for mania?",
]


def _total(iterations: list, field: str) -> int | None:
    """Sum one token field across a turn's iterations, or None if any iteration's count is unknown

    Summed here rather than accumulated in the agentic loop

    A sum over only the known iterations would reach the CSV as a total count that is incomplete
    """
    values = [getattr(iteration, field) for iteration in iterations]
    if any(value is None for value in values):
        return None
    return sum(values)


def run_one(question: str, user, branch: str) -> dict:
    """Run the assistant for a single question and return a result row.

    Uses ThreadPoolExecutor for concurrency.

    """
    # Time the full run_assistant call here rather than inside it: run_one already
    # owns the whole call, so wall-clock duration needs no plumbing through the production code path
    start = perf_counter()
    try:
        result = run_assistant(message=question, user=user)
        duration_s = perf_counter() - start
        return {
            "branch": branch,
            "question": question,
            # error is filled only when the whole turn failed and the except branch wrote the row
            "error": None,
            "response_output_text": result.output_text,
            "duration_s": duration_s,
            "total_input_tokens": _total(result.token_usages, "input_tokens"),
            "total_cached_input_tokens": _total(result.token_usages, "cached_input_tokens"),
            "total_output_tokens": _total(result.token_usages, "output_tokens"),
            "total_reasoning_output_tokens": _total(result.token_usages, "reasoning_output_tokens"),
            # Flat summaries for scanning. total_tool_errors > 0 with error None means a tool
            # failed inside the loop but the run still returned an answer.
            "total_tool_calls": len(result.tool_calls),
            # total_tool_errors counts tool calls whose status isn't OK (FAILED or UNREGISTERED). 
            # Those failures don't raise. The loop catches the exception, records it, and sends 
            # "Error executing function call: …" back to the model. 
            # The model then usually retries or writes a confident answer anyway
            "total_tool_errors": sum(1 for c in result.tool_calls if c.status is not ToolCallStatus.OK),
            # Per turn tool call details — status, the model's arguments (query), output/error
            "tool_calls_json": json.dumps([asdict(c) for c in result.tool_calls]),
            # Per iteration token usage detail the flat totals can't hold: which iteration caching engaged on
            "token_usages_json": json.dumps([asdict(t) for t in result.token_usages]),
        }
    except Exception as e:
        duration_s = perf_counter() - start
        logger.error(f"Error evaluating question '{question}': {e}")
        return {
            "branch": branch,
            "question": question,
            "error": str(e),
            "response_output_text": None,
            "duration_s": duration_s,
            # Tool calls and token usage before the error raised are not collected
            "total_input_tokens": None,
            "total_cached_input_tokens": None,
            "total_output_tokens": None,
            "total_reasoning_output_tokens": None,
            "total_tool_calls": None,
            "total_tool_errors": None,
            "tool_calls_json": None,
            "token_usages_json": None,
        }


def main():
    branch = os.environ.get("EVAL_BRANCH", "develop")

    User = get_user_model()
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        raise RuntimeError("No superuser found. Create one with manage.py createsuperuser.")

    logger.info(f"Starting evaluation: branch={branch}, model={MODEL_NAME}, questions={len(QUESTIONS)}")

    # Load the embedding model before starting any workers
    # TODO: Fix TransformerModel in its own commit — __new__ publishes _instance 
    # before .model loads, so concurrent callers get a half-built object
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

    # TODO: Write the system prompt next to the CSV ({branch}-{timestamp}.prompt.txt) so runs
    # from before and after a prompt change can be told apart

    # pandas was never in the backend image's requirements.txt
    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(results)

    logger.info(f"Results saved to {output_path}")


if __name__ == "__main__":
    main()
