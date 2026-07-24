import json
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


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

    Deliberately deferred (add later as defaulted fields, no call-site churn):
    token/cost usage (from response.usage) and turn count. Answer-quality scoring —
    ground truth, citation accuracy, LLM-as-judge — is a separate layer above this
    one, not a field here.
    """

    output_text: str
    response_id: str
    tool_calls: list[ToolCall]


def handle_tool_calls_with_reasoning(
    response, client, model_defaults: dict, tools: list, user
) -> AssistantResult:
    """Run the agentic loop until the model stops emitting function calls.

    Parameters
    ----------
    response : OpenAI Response
        The initial response from the model.
    client : OpenAI
        The OpenAI client instance.
    model_defaults : dict
        Keyword arguments forwarded to every client.responses.create call.
    tools : list[Tool]
        The available tools; each has a `.name` and a `.run(user, **arguments)`.
    user : User
        The request user, bound into each tool call at dispatch time.

    Returns
    -------
    AssistantResult
        The final response text and id, plus the ordered ToolCall records for every
        tool invocation across all loop iterations (for eval / observability).
    """
    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls
    tool_calls: list[ToolCall] = []
    while True:
        # user is threaded through so tools that need it (document access control)
        # get it at dispatch time; tools that don't simply ignore it.
        tool_output_messages, calls = invoke_functions_from_response(response, tools, user)
        tool_calls.extend(calls)
        if not tool_output_messages:  # model emitted no tool calls this turn → done
            logger.info("Reasoning completed")
            final_response_output_text = response.output_text
            final_response_id = response.id
            logger.info(f"Final response: {final_response_output_text}")
            return AssistantResult(
                output_text=final_response_output_text,
                response_id=final_response_id,
                tool_calls=tool_calls,
            )
        else:
            logger.info("More reasoning required, continuing...")
            response = client.responses.create(
                input=tool_output_messages,
                previous_response_id=response.id,
                **model_defaults,
            )


def invoke_functions_from_response(
    response, tools: list, user
) -> tuple[list[dict], list[ToolCall]]:
    """Extract all function calls from the response, look up the corresponding tool(s) and execute them.
    (This would be a good place to handle asynchroneous tool calls, or ones that take a while to execute.)

    Parameters
    ----------
    response : OpenAI Response
        The response object from OpenAI containing output items that may include function calls
    tools : list[Tool]
        The available tools. Indexed by `.name` here to dispatch the model's calls; each
        is invoked as `tool.run(user, **arguments)`.
    user : User
        The request user, forwarded to every tool call so tools that need it (e.g.
        document access control) get it, and tools that don't simply ignore it.

    Returns
    -------
    tuple[list[dict], list[ToolCall]]
        - intermediate_messages: the function_call_output messages to append to the
          conversation and feed back as the next turn's input. Each contains:
            - type: "function_call_output"
            - call_id: the unique identifier for the function call
            - output: the result returned by the executed function (string or error message)
        - tool_calls: one ToolCall record per function call — tool name, outcome status,
          the model's arguments, and the output or error — kept distinct from the OpenAI
          payload above so the run's tool usage is observable (see AssistantResult,
          eval_assistant.py).
    """

    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls

    # Index the tools by name so a model-supplied call name can be looked up. .get()
    # returns None for an unknown name, handled explicitly below.
    tools_by_name = {tool.name: tool for tool in tools}
    intermediate_messages = []
    tool_calls: list[ToolCall] = []
    for response_item in response.output:
        if response_item.type == "function_call":
            target_tool = tools_by_name.get(response_item.name)
            # Parsed below; stays None if the model's argument JSON can't be parsed,
            # so a FAILED record still reports whatever we managed to read.
            arguments = None
            if target_tool is not None:
                try:
                    arguments = json.loads(response_item.arguments)
                    logger.info(
                        f"Invoking tool: {response_item.name} with arguments: {arguments}"
                    )
                    tool_output = target_tool.run(user=user, **arguments)
                    logger.info(f"Tool {response_item.name} completed successfully")
                    tool_calls.append(
                        ToolCall(
                            name=response_item.name,
                            status=ToolCallStatus.OK,
                            arguments=arguments,
                            output=tool_output,
                        )
                    )
                except Exception as e:
                    msg = f"Error executing function call: {response_item.name}: {e}"
                    tool_output = msg
                    logger.error(msg, exc_info=True)
                    tool_calls.append(
                        ToolCall(
                            name=response_item.name,
                            status=ToolCallStatus.FAILED,
                            arguments=arguments,
                            error=str(e),
                        )
                    )
            else:
                msg = f"ERROR - No tool registered for function call: {response_item.name}"
                tool_output = msg
                logger.error(msg)
                tool_calls.append(
                    ToolCall(
                        name=response_item.name,
                        status=ToolCallStatus.UNREGISTERED,
                        error=msg,
                    )
                )
            intermediate_messages.append(
                {
                    "type": "function_call_output",
                    "call_id": response_item.call_id,
                    "output": tool_output,
                }
            )
        elif response_item.type == "reasoning":
            logger.info(f"Reasoning step: {response_item.summary}")
    return intermediate_messages, tool_calls
