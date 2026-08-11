"""The assistant's data types: what the model is offered, and what a run produced.

Gathered here, apart from the code that uses them, so the shapes can be read without
the dispatch and loop logic wrapped around them. Two groups:

  - Tool — the definition side. One assistant tool: the schema the model sees and the
    function we run. Instances are registered in tool_services.py's TOOLS list.
  - ToolCallStatus / ToolCall / AssistantResult — the record side. Built by the agentic
    loop as a run proceeds, and read by eval_assistant.py to fill the result CSV.

This module imports nothing from the package, so it cannot take part in an import
cycle however many modules come to need a type from it.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Callable


@dataclass(frozen=True)
class Tool:
    """One assistant tool: the schema the model sees (data) and the function we run
    (behavior), bundled together under a single name.

    Bundling name/description/parameters/run in one object means each tool is
    registered in exactly one place — the TOOLS list in tool_services.py — so the
    schema sent to the model and the callable actually invoked can never drift
    apart. Adding a tool is appending one Tool to TOOLS; nothing else changes.

    Behavior is stored as the `run` field (composition) rather than a method on a
    subclass because our tools differ only in *which* function runs — same schema()
    machinery, same fields, just a different callable. They are instances of one
    concept, not distinct kinds of thing.

    Flip to `Tool(ABC)` + one subclass per tool (with `run` as a method) if a
    tool ever needs more than a swapped-in function — specifically when it:
      - carries per-type state/setup (a client, connection, cache, validated config);
      - overrides more than run (e.g. a custom schema() shape, or extra methods like
        validate_arguments / cost_estimate);
      - needs a per-type run signature or an @abstractmethod-enforced contract so a
        tool with no behavior fails at class-definition time, not at call time.
    Until then the callable field is lighter and keeps registration drift-proof.
    """

    name: str
    description: str
    parameters: dict
    # run(user, **arguments) -> str. Every tool takes the request `user` so the dispatch
    # loop can call them uniformly; a tool that doesn't need it simply ignores it.
    run: Callable

    def schema(self) -> dict:
        # Flattened Responses-API shape: name/description/parameters at the top level.
        # This is intentionally NOT the nested {"function": {...}} shape that the Chat
        # Completions API (and services/tools/tools.py's create_tool_dict) uses.
        return {
            "type": "function",
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
        }


class ToolCallStatus(str, Enum):
    """The outcome of a single tool call. Three distinct states, deliberately not a
    bool: FAILED (the tool matched but raised) and UNREGISTERED (the model asked for
    a tool name we don't have) are opposite diagnoses — a code/data fault vs. the
    model hallucinating a tool — and an eval on tool selection needs to tell them
    apart. str-based so it serializes straight into CSV/JSON.
    """

    OK = "ok"
    FAILED = "failed"              # tool matched but raised
    UNREGISTERED = "unregistered"  # no tool registered for the model's requested name


@dataclass(frozen=True)
class ToolCall:
    """A record of one tool call the model made — a complete unit for eval:
    which tool, with what query (`arguments`), and what came back (`output`) or
    broke (`error`).

    `output` and `error` are disjoint by status: `output` holds the retrieved
    content on OK; `error` holds the detail when status is not OK. `arguments`
    is the model-generated query (the primary tool-selection signal); it is None
    only when the model's argument JSON could not be parsed.
    """

    name: str
    status: ToolCallStatus
    arguments: dict | None = None   # the query the model generated (parsed)
    output: str | None = None       # the tool's result on success (retrieved content)
    error: str | None = None        # the failure detail when status is not OK


@dataclass(frozen=True)
class AssistantResult:
    """What a full agentic run produced: the model's final text, the id of the final
    response (for multi-turn continuity), and the ordered ToolCall records for every
    tool invocation across all loop iterations.

    TODO: capture token usage and turn count — the other axis, alongside tool
    selection, for comparing strategies. The design is settled but unbuilt:
      - Six defaulted int fields: input_tokens, cached_tokens, output_tokens,
        reasoning_tokens, total_tokens, turn_count. All three existing construction
        sites pass keywords, so adding them is inert — this is exactly the property
        the dataclass was chosen for over a widened tuple.
      - Accumulate at the top of the while body in handle_tool_calls_with_reasoning
        (agentic_loop.py), before invoke_functions_from_response. That counts the
        initial response (created in run_assistant and passed in) and every
        continuation exactly once, including the terminal turn before the return.
        turn_count is then simply the number of responses.create calls the run made.
      - Read through a helper that walks response.usage defensively rather than
        type-checking only the leaf: reasoning_tokens lives at
        usage.output_tokens_details.reasoning_tokens and cached_tokens at
        usage.input_tokens_details.cached_tokens, so a None usage raises
        AttributeError before any leaf check runs. The helper must also reject
        non-ints — the loop tests build responses as bare MagicMocks, and MagicMock
        implements __add__/__radd__, so mock values would accumulate silently into
        the CSV rather than failing loudly.
      - cached_tokens is not optional: every turn resends context via
        previous_response_id, so a large share of input_tokens bills at the cached
        rate. Without the split, a cost figure derived later from input_tokens
        overstates spend and cannot be corrected from the CSV afterwards.
      - Dollar cost stays out of this dataclass: it needs a price table keyed by
        model *and* date, which goes stale and then lies. Derive it in pandas from
        the token columns plus the CSV's model column. If a table is ever wanted, the
        house pattern is PRICING_DOLLARS_PER_MILLION_TOKENS in
        api/services/llm_services.py — which has no reasoning or cached tier yet.

    Known hole that work would widen: if client.responses.create raises mid-loop the
    exception propagates out and every ToolCall collected so far is lost with it —
    the eval row reads tool_call_count 0 despite real calls having run, and would
    likewise read total_tokens 0 despite tokens having been billed. Closing it means
    deciding what this dataclass describes: a successful run, or whatever actually
    happened (a partial result returned with an error field, or carried on the
    exception).

    Answer-quality scoring — ground truth, citation accuracy, LLM-as-judge — is a
    separate layer above this one, not a field here; see the scoring TODO in
    eval_assistant.py.
    """

    output_text: str
    response_id: str
    tool_calls: list[ToolCall]
