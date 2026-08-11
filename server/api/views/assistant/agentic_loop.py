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

    #TOOD: Rename tools_call so the variable name explains why it is defined
    tool_calls: list[ToolCall] = []
    while True:
        # user is threaded through so tools that need it get it at dispatch time; tools that don't simply ignore it.
        #TOOD: Rename calls so the variable name explains why it is defined
        tool_output_messages, calls = invoke_functions_from_response(response, tools, user)
        tool_calls.extend(calls)
        if not tool_output_messages:  # Model emitted no tool calls this turn 
            return AssistantResult(
                output_text=response.output_text,
                response_id=response.id,
                tool_calls=tool_calls,
            )
        else:
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

            #TODO: Abstract out the logic in this branch of the conditional into its own function
            
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
