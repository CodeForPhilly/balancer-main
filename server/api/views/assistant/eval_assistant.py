# Generates eval results to CSV. Run from inside the container:
#   docker compose exec backend python api/views/assistant/eval_assistant.py
#
# Needs OPENAI_API_KEY (from config/env/dev.env), a superuser, and embedded
# documents for that user. Writes to results/ next to this file, which the
# ./server bind mount surfaces on the host.
#
# This is NOT a standalone script and cannot be run with `uv run --script` or from
# the host: django.setup() below loads INSTALLED_APPS, pulling in psycopg2, pgvector,
# DRF, djoser and sentence_transformers — the backend image's full requirements.txt.
# A PEP 723 dependency header would have to duplicate that list to stay correct, and
# the host cannot resolve SQL_HOST=db off the docker network anyway. It previously
# carried such a header declaring only pandas/openai/django; that has been removed
# rather than repaired.

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
# Three levels up from api/views/assistant/ is /usr/src/server, where the
# balancer_backend settings package lives. This insert is doing real work: running
# a script file puts the *script's* directory on sys.path[0], not the working
# directory, and the image sets no PYTHONPATH — so without it django.setup() below
# raises ModuleNotFoundError on balancer_backend.settings.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "balancer_backend.settings")

import django
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from api.views.assistant.assistant_services import run_assistant, MODEL_NAME # noqa: E402
from api.views.assistant.agentic_loop import ToolCallStatus
# Imported to warm the embedding model in main() before the worker pool starts —
# see the call site for why this process needs it and the web path does not.
from api.services.sentencetTransformer_model import TransformerModel  # noqa: E402
# TODO: write INSTRUCTIONS to a sidecar file alongside the CSV in main(), named
# results/{branch}-{timestamp}.prompt.txt so the pairing cannot come apart:
#     f.write(f"branch: {branch}\nmodel: {MODEL_NAME}\n\n{INSTRUCTIONS}")
# Two alternatives were considered and rejected: a full-text CSV column repeats
# ~2.1KB of multi-line prose in every row and buries a cross-branch CSV diff in
# prompt noise; logging it at run time leaves nothing behind in results/, which is
# exactly the failure this is meant to prevent (a CSV whose prompt is unrecoverable
# months later). Add an instructions_hash column *as well* only if runs are ever
# concatenated into one DataFrame, where a groupby-able key beats diffing sidecars.
# Until that lands, INSTRUCTIONS is imported but deliberately unused.
from api.views.assistant.assistant_prompts import INSTRUCTIONS

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Model and INSTRUCTIONS both come from their source of truth rather than being
# restated here: MODEL_NAME from assistant_services.py (imported above, and used for
# the CSV's model column), INSTRUCTIONS from assistant_prompts.py (see sidecar TODO).

# TODO: add a scoring layer. This is the biggest remaining gap, and it needs a design
# pass rather than a patch. As it stands this file is a *generation* harness, not an
# eval: QUESTIONS below carries no ground truth, so the CSV records what the
# assistant said and — since the tool-call columns landed — which tools it chose, but
# nothing about whether the answer was right. Open questions for that pass:
#   - Ground truth per question: expected medications/claims, expected source
#     documents (which citations the answer should rest on), or both.
#   - Grading method: deterministic assertions (does the answer cite doc X, name drug
#     Y) vs LLM-as-judge for faithfulness. Likely both — assertions for retrieval
#     correctness, judge for answer quality.
#   - Citation accuracy is the cheapest real signal available: INSTRUCTIONS mandates
#     the [Name {name}, Page {page_number}] format, so citations can be parsed out of
#     response_output_text and checked against what search_documents actually
#     returned — already captured in the tool_calls_json column. That catches
#     fabricated citations, the failure mode that matters most clinically.
#   - Where scoring runs: as a separate pass over an already-written CSV, not inside
#     run_one, so scoring can be revised and re-run without paying for generation
#     again.

# The CSV's columns, in order. This is the single source of truth for column order:
# csv.DictWriter emits keys in this order regardless of the order the row dicts in
# run_one happen to list them, so the two row literals no longer have to be kept in
# lockstep (they used to, because as_completed returns rows nondeterministically and
# a DataFrame took its column order from whichever row landed first). DictWriter also
# raises on a key it doesn't know, so adding a column to a row literal and forgetting
# it here fails loudly instead of silently dropping the column.
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
    # Time the full run_assistant call here rather than inside it: run_one already
    # owns the whole call, so wall-clock duration needs no plumbing through the
    # production code path (see AssistantResult — duration is not carried).
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

    # Load the embedding model before starting any workers. This line is load-bearing
    # for two separate reasons.
    #
    # 1. It removes concurrency at the moment of loading, which is the only thing
    #    keeping this eval off a live race in TransformerModel (see the TODO below).
    #    get_instance() runs here on the main thread, before any worker exists, so
    #    the singleton is fully built by the time anything can contend for it. The
    #    web path is unaffected because api/apps.py preloads the model in ready() —
    #    but only when sys.argv[1:2] == ['runserver'], which running this file as a
    #    script does not match. So this process starts cold, and without this line
    #    all five workers reach a cold TransformerModel at once. That is not
    #    hypothetical: the first real eval run (results/521-research-agent-tools-
    #    20260804T181410.csv) had 3 of 9 document searches fail with
    #    "'TransformerModel' object has no attribute 'model'".
    #
    #    Those three failures were invisible in that CSV — every row still read
    #    tool_error_count 0 — because search_documents caught the exception and
    #    returned it as a string, which is indistinguishable from a retrieval that
    #    worked. That concealment is fixed separately (search_tool.py now lets it
    #    raise, so the loop records ToolCallStatus.FAILED), and the two fixes are
    #    complements rather than alternatives: this warm-up removes the trigger,
    #    search_tool.py removes the concealment. A future failure here would now be
    #    loud rather than silent, but it would still be a failure.
    #
    # 2. It fixes duration_s. Loading costs ~700ms of Hugging Face metadata requests
    #    plus weight loading. Left to the workers, that cost lands inside whichever
    #    run_assistant call triggers it, so that question's duration_s is inflated by
    #    work that has nothing to do with the question — and the column stops being
    #    comparable across rows. Warming here moves the cost outside every
    #    measurement, which matters because duration_s exists precisely to compare
    #    questions and branches.
    #
    # TODO: fix the TransformerModel singleton itself
    # (api/services/sentencetTransformer_model.py) — this warm-up only hides the
    # defect at one call site. __new__ assigns cls._instance *before* setting
    # .model, so any thread arriving in that ~700ms window gets a non-None but
    # half-built object back. Two independent fixes:
    #   - Publish last: build the object fully, assign cls._instance only afterwards.
    #     This one is needed even single-threaded. If SentenceTransformer() raises,
    #     the bare object has already been assigned, leaving a permanently poisoned
    #     singleton that every later call returns without .model. api/apps.py:37
    #     comments that "_instance stays None on failure, so the first actual request
    #     will attempt to load the model again" — which is not true today.
    #   - Guard the load with a threading.Lock (double-checked) so two cold callers
    #     don't both load it.
    # Until that lands, anything that reaches get_instance() from a worker thread
    # before this warm-up runs — a new concurrent entry point, or a reordering of
    # main() — silently re-exposes the race. Note the fix is production code shared
    # with the web path and uploadFile/views.py:129, not eval-only, so it may belong
    # in its own commit rather than this branch.
    TransformerModel.get_instance()

    # ThreadPoolExecutor runs questions concurrently — see run_one docstring
    # for trade-off discussion vs asyncio.gather + await run_assistant.
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

    # stdlib csv rather than pandas: this is one write of a handful of dict rows, and
    # DictWriter quotes the embedded commas and newlines in response_output_text and
    # tool_calls_json correctly. pandas was never in the backend image's
    # requirements.txt, so the old pd.DataFrame(...).to_csv() would have raised
    # ModuleNotFoundError here — after every question had already been generated and
    # billed. newline="" is required on the file object; csv does its own line endings.
    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(results)

    logger.info(f"Results saved to {output_path}")


if __name__ == "__main__":
    main()
