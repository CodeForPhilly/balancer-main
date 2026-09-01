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

    # Every tool call the agentic loop made before exiting
    agentic_loop_tool_call_executions= []
    # TODO: agentic_loop_turns: list[TurnUsage] = [] — the per-iteration token usage accumulator
    
    while True:
        # TODO: append _turn_usage(response) here — top of the body counts every response once, terminal turn included
        # user is threaded through so tools that need it get it at dispatch time

        # TODO: Add a schema function to ToolCallExecution
        tool_output_schemas, tool_call_executions = handle_tool_calls(response, tools, user)

        # TODO: Rewrite to .append every iteration's list of tools
        # TODO: Add a data type to contain each iteration's parameters, response id, 
        # token usage, and  tool calls  or output text from the client response  and a function 
        # for the output text and corresponding response id 
    
        # .extend splices every iteration's list of tools into one list
        agentic_loop_tool_call_executions.extend(tool_call_executions)

        # Exit agentic loop when model response doesn't contain any tool calls
        if not tool_output_schemas:
            return AgentResult(
                output_text=response.output_text,
                response_id=response.id,
                tool_calls=agentic_loop_tool_call_executions,
                # TODO: turns=agentic_loop_turns
            )

        #TODO: Add error handling to collect partial AgentResult tool calls
        response = client.responses.create(
            input=tool_output_schemas,
            previous_response_id=response.id,
            **model_defaults,
        )


# TODO: _turn_usage(response) -> TurnUsage — isinstance(int) guard on every leaf (MagicMock's __radd__ hides bad reads)
def handle_tool_calls(
    response, tools: list, user
) -> tuple[list[dict], list[ToolCallExecution]]:

    # Index the tools by name so a model-supplied call name can be looked up. .get()
    # returns None for an unknown name, handled explicitly below.
    tools_by_name = {tool.name: tool for tool in tools}
    
    tool_output_schemas = []
    tool_call_executions: list[ToolCallExecution] = []

    for response_item in response.output:
        if response_item.type == "reasoning":
            #logger.info(f"Reasoning step: {response_item.summary}")
            pass

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
