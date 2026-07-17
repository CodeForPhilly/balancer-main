import json
import logging

logger = logging.getLogger(__name__)


def handle_tool_calls_with_reasoning(
    response, client, model_defaults: dict, tools: list, user
) -> tuple[str, str]:
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
    tuple[str, str]
        (final_response_output_text, final_response_id)
    """
    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls
    while True:
        function_responses = invoke_functions_from_response(response, tools, user)
        if len(function_responses) == 0: # We're done reasoning
            logger.info("Reasoning completed")
            final_response_output_text = response.output_text
            final_response_id = response.id
            logger.info(f"Final response: {final_response_output_text}")
            return final_response_output_text, final_response_id
        else:
            logger.info("More reasoning required, continuing...")
            response = client.responses.create(
                input=function_responses,
                previous_response_id=response.id,
                **model_defaults,
            )


def invoke_functions_from_response(
    response, tools: list, user
) -> list[dict]:
    """Extract all function calls from the response, look up the corresponding tool(s) and execute them.
    (This would be a good place to handle asynchroneous tool calls, or ones that take a while to execute.)
    This returns a list of messages to be added to the conversation history.

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
    list[dict]
        List of function call output messages formatted for the OpenAI conversation.
        Each message contains:
        - type: "function_call_output"
        - call_id: The unique identifier for the function call
        - output: The result returned by the executed function (string or error message)
    """

    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls

    # Index the tools by name so a model-supplied call name can be looked up. .get()
    # returns None for an unknown name, handled explicitly below.
    tools_by_name = {tool.name: tool for tool in tools}
    intermediate_messages = []
    for response_item in response.output:
        if response_item.type == "function_call":
            target_tool = tools_by_name.get(response_item.name)
            if target_tool is not None:
                try:
                    arguments = json.loads(response_item.arguments)
                    logger.info(
                        f"Invoking tool: {response_item.name} with arguments: {arguments}"
                    )
                    tool_output = target_tool.run(user=user, **arguments)
                    logger.info(f"Tool {response_item.name} completed successfully")
                except Exception as e:
                    msg = f"Error executing function call: {response_item.name}: {e}"
                    tool_output = msg
                    logger.error(msg, exc_info=True)
            else:
                msg = f"ERROR - No tool registered for function call: {response_item.name}"
                tool_output = msg
                logger.error(msg)
            intermediate_messages.append(
                {
                    "type": "function_call_output",
                    "call_id": response_item.call_id,
                    "output": tool_output,
                }
            )
        elif response_item.type == "reasoning":
            logger.info(f"Reasoning step: {response_item.summary}")
    return intermediate_messages