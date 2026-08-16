import json
import logging

from api.views.assistant.assistant_types import (
    AgentResult,
    ToolCallExecution,
    ToolCallStatus,
)

logger = logging.getLogger(__name__)


def run_agentic_loop(
    response, client, model_defaults: dict, tools: list, user
) -> AgentResult:
    """
    TODO: Read server/api/views/assistant  and fill in the docstring

    TODO: Reference  the OpenAI Cookbook   in the docstring 

    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls
    """

    # Every tool call the run made, accumulated across turns: AgentResult reports
    # the whole run, not just the turn that happened to end it.
    agentic_loop_tool_call_executions= []
    while True:
        # user is threaded through so tools that need it get it at dispatch time
    
        tool_output_schemas, tool_call_executions = handle_tool_calls(response, tools, user)
        
        # TODO: record which turn each call belongs to. .extend splices every turn's
        # list into one accumulator, so turn boundaries are dissolved here and are not
        # recoverable anywhere downstream: ToolCallExecution carries no turn field,
        # only the *final* response.id is kept (the intermediate ids that would rebuild
        # the chain are dropped), and eval_assistant.py serializes this same flat list
        # into tool_calls_json. Three calls in one turn and three calls across three
        # turns are therefore indistinguishable in every artifact this branch produces
        # — which is the distinction a tool-selection eval most wants. It was already
        # lost once: the 08-04 run made 9 calls for 5 questions because the model
        # retried after error strings, and the retry structure is unrecoverable from
        # that CSV.
        #
        # Add `turn: int` to ToolCallExecution, thread a loop counter through
        # handle_tool_calls into _execute_function_call, and set turn= at the three
        # construction sites. Additive by design: tool_calls stays flat, so
        # eval_assistant.py's four readers and every existing test keep working, and
        # groupby(result.tool_calls, key=lambda c: c.turn) recovers the grouping.
        #
        # Do NOT reach for .append instead. It changes tool_calls to list[list[...]],
        # and eval_assistant.py:170 reads c.status before the row dict is built — so
        # the AttributeError is swallowed by run_one's except and every question
        # returns an error row blaming run_assistant, with nothing pointing at the
        # serializer. tool_call_count (a len) would not raise at all; it would silently
        # start reporting turns in a column named calls. The terminal turn also appends
        # [], so every run would carry a trailing empty list and a run that called no
        # tools would read [[]] rather than [].
        #
        # Complements rather than duplicates the turn_count field in AgentResult's
        # TODO: that records how many turns, this records which calls were in each.
        agentic_loop_tool_call_executions.extend(tool_call_executions)

        # Exit agentic loop when model response doesn't contain any tool calls
        if not tool_output_schemas:
            return AgentResult(
                output_text=response.output_text,
                response_id=response.id,
                tool_calls=agentic_loop_tool_call_executions,
            )

        response = client.responses.create(
            input=tool_output_schemas,
            previous_response_id=response.id,
            **model_defaults,
        )


def handle_tool_calls(
    response, tools: list, user
) -> tuple[list[dict], list[ToolCallExecution]]:
    """
    TODO: Read server/api/views/assistant  and fill in the docstring

    TODO: Reference  the OpenAI Cookbook   in the docstring 

    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls
    """

    # Index the tools by name so a model-supplied call name can be looked up. .get()
    # returns None for an unknown name, handled explicitly below.
    tools_by_name = {tool.name: tool for tool in tools}
    
    tool_output_schemas = []
    tool_call_executions: list[ToolCallExecution] = []

    for response_item in response.output:
        if response_item.type == "reasoning":
            logger.info(f"Reasoning step: {response_item.summary}")

        elif response_item.type == "function_call":

            tool_output, tool_call_execution = _execute_function_call(response_item, tools_by_name, user)

            tool_output_schemas.append(
                {
                    "type": "function_call_output",
                    "call_id": response_item.call_id,
                    "output": tool_output,
                }
            )
            
            tool_call_executions.append(tool_call_execution)


    return tool_output_schemas, tool_call_executions


def _execute_function_call(
    response_item, tools_by_name: dict, user
) -> tuple[str, ToolCallExecution]:
    """Run the one tool the model asked for, on any of its three outcomes.

    Returns a pair because the two results have different destinations: the string is
    fed back to the model as the function_call_output, while the ToolCallExecution is
    kept for the eval and never reaches the model.

    They are not derivable from each other, which is the trap in collapsing this to a
    single return. On OK the two carry the same text, and on UNREGISTERED they do too —
    but on FAILED the model gets a message naming the tool it called, while
    ToolCallExecution.error holds the bare exception. Deriving one from the other would
    quietly change what the model sees after a tool failure.
    """
    target_tool = tools_by_name.get(response_item.name)
    # Parsed below; stays None if the model's argument JSON can't be parsed,
    # so a FAILED record still reports whatever we managed to read.
    arguments = None

    if target_tool is None:
        msg = f"ERROR - No tool registered for function call: {response_item.name}"
        logger.error(msg)
        return msg, ToolCallExecution(
            name=response_item.name,
            status=ToolCallStatus.UNREGISTERED,
            error=msg,
        )

    try:
        arguments = json.loads(response_item.arguments)
        logger.info(
            f"Invoking tool: {response_item.name} with arguments: {arguments}"
        )
        tool_output = target_tool.run(user=user, **arguments)
        logger.info(f"Tool {response_item.name} completed successfully")
        return tool_output, ToolCallExecution(
            name=response_item.name,
            status=ToolCallStatus.OK,
            arguments=arguments,
            output=tool_output,
        )
    except Exception as e:
        msg = f"Error executing function call: {response_item.name}: {e}"
        logger.error(msg, exc_info=True)
        return msg, ToolCallExecution(
            name=response_item.name,
            status=ToolCallStatus.FAILED,
            arguments=arguments,
            error=str(e),
        )
