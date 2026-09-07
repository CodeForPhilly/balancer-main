import sys
from pathlib import Path

repo_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(repo_root))

from server.api.views.assistant.assistant_prompts import INSTRUCTIONS


def create_prompt(context):
    question = context["vars"]["question"]

    return [
        {"role": "system", "content": INSTRUCTIONS},
        {"role": "user", "content": question},
    ]