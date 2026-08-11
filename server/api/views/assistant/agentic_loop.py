import json
import logging

from api.views.assistant.assistant_types import (
    AssistantResult,
    ToolCall,
    ToolCallStatus,
)

logger = logging.getLogger(__name__)


def handle_tool_calls_with_reasoning(
    response, client, model_defaults: dict, tools: list, user
) -> AssistantResult:
    """
    TODO: Read server/api/views/assistant  and fill in the docstring

    TODO: Reference  the OpenAI Cookbook   in the docstring 

    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls
    """

    # Every tool call the run made, accumulated across turns: AssistantResult reports
    # the whole run, not just the turn that happened to end it.
    all_tool_calls: list[ToolCall] = []
    while True:
        # user is threaded through so tools that need it get it at dispatch time; tools that don't simply ignore it.
        tool_output_messages, turn_tool_calls = invoke_functions_from_response(response, tools, user)
        all_tool_calls.extend(turn_tool_calls)
        if not tool_output_messages:  # Model emitted no tool calls this turn
            logger.info("Reasoning completed")
            final_response_output_text = response.output_text
            final_response_id = response.id
            logger.info(f"Final response: {final_response_output_text}")
            return AssistantResult(
                output_text=final_response_output_text,
                response_id=final_response_id,
                tool_calls=all_tool_calls,
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
    """
    TODO: Read server/api/views/assistant  and fill in the docstring

    TODO: Reference  the OpenAI Cookbook   in the docstring 

    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls
    """

    # Index the tools by name so a model-supplied call name can be looked up. .get()
    # returns None for an unknown name, handled explicitly below.
    tools_by_name = {tool.name: tool for tool in tools}
    intermediate_messages = []
    tool_calls: list[ToolCall] = []

    for response_item in response.output:
        if response_item.type == "function_call":
            tool_output, tool_call = _execute_function_call(
                response_item, tools_by_name, user
            )
            tool_calls.append(tool_call)
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


def _execute_function_call(
    response_item, tools_by_name: dict, user
) -> tuple[str, ToolCall]:
    """Run the one tool the model asked for, on any of its three outcomes.

    Returns a pair because the two results have different destinations: the string is
    fed back to the model as the function_call_output, while the ToolCall is kept for
    the eval and never reaches the model.

    They are not derivable from each other, which is the trap in collapsing this to a
    single return. On OK the two carry the same text, and on UNREGISTERED they do too —
    but on FAILED the model gets a message naming the tool it called, while
    ToolCall.error holds the bare exception. Deriving one from the other would quietly
    change what the model sees after a tool failure.
    """
    target_tool = tools_by_name.get(response_item.name)
    # Parsed below; stays None if the model's argument JSON can't be parsed,
    # so a FAILED record still reports whatever we managed to read.
    arguments = None

    if target_tool is None:
        msg = f"ERROR - No tool registered for function call: {response_item.name}"
        logger.error(msg)
        return msg, ToolCall(
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
        return tool_output, ToolCall(
            name=response_item.name,
            status=ToolCallStatus.OK,
            arguments=arguments,
            output=tool_output,
        )
    except Exception as e:
        msg = f"Error executing function call: {response_item.name}: {e}"
        logger.error(msg, exc_info=True)
        return msg, ToolCall(
            name=response_item.name,
            status=ToolCallStatus.FAILED,
            arguments=arguments,
            error=str(e),
        )
