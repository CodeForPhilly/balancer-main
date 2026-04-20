
TOOL_DESCRIPTION = """
Search the user's uploaded documents for information relevant to answering their question.
Call this function when you need to find specific information from the user's documents
to provide an accurate, citation-backed response. Always search before answering questions
about document content.
"""

TOOL_PROPERTY_DESCRIPTION = """
A specific search query to find relevant information in the user's documents.
Use keywords, phrases, or questions related to what the user is asking about.
Be specific rather than generic - use terms that would appear in the relevant documents.
"""

def search_documents(query: str, user=user) -> str:
    """
    Search through user's uploaded documents using semantic similarity.

    This function performs vector similarity search against the user's document corpus
    and returns formatted results with context information for the LLM to use.

    Parameters
    ----------
    query : str
        The search query string
    user : User
        The authenticated user whose documents to search

    Returns
    -------
    str
        Formatted search results containing document excerpts with metadata

    Raises
    ------
    Exception
        If embedding search fails
    """

    try:
        embeddings_results = get_closest_embeddings(
            user=user, message_data=query.strip()
        )
        embeddings_results = convert_uuids(embeddings_results)

        if not embeddings_results:
            return "No relevant documents found for your query. Please try different search terms or upload documents first."

        # Format results with clear structure and metadata
        prompt_texts = [
            f"[Document {i + 1} - File: {obj['file_id']}, Name: {obj['name']}, Page: {obj['page_number']}, Chunk: {obj['chunk_number']}, Similarity: {1 - obj['distance']:.3f}]\n{obj['text']}\n[End Document {i + 1}]"
            for i, obj in enumerate(embeddings_results)
        ]

        return "\n\n".join(prompt_texts)

    except Exception as e:
        return f"Error searching documents: {str(e)}. Please try again if the issue persists."

def handle_tool_calls_with_reasoning():
    # Open AI Cookbook: Handling Function Calls with Reasoning Models
    # https://cookbook.openai.com/examples/reasoning_function_calls
    while True:
        # Mapping of the tool names we tell the model about and the functions that implement them
        function_responses = invoke_functions_from_response(
            response, tool_mapping={"search_documents": search_documents}
        )
        if len(function_responses) == 0:  # We're done reasoning
            logger.info("Reasoning completed")
            final_response_output_text = response.output_text
            final_response_id = response.id
            logger.info(f"Final response: {final_response_output_text}")
            break
        else:
            logger.info("More reasoning required, continuing...")
            response = client.responses.create(
                input=function_responses,
                previous_response_id=response.id,
                **MODEL_DEFAULTS,
            )
            # # Accumulate token usage from reasoning iterations
            # if hasattr(response, "usage"):
            #     total_token_usage["input_tokens"] += getattr(
            #         response.usage, "input_tokens", 0
            #     )
            #     total_token_usage["output_tokens"] += getattr(
            #         response.usage, "output_tokens", 0
            #     )
    
    
    



# Open AI Cookbook: Handling Function Calls with Reasoning Models
# https://cookbook.openai.com/examples/reasoning_function_calls
def invoke_functions_from_response(
    response, tool_mapping: dict[str, Callable]
) -> list[dict]:
    """Extract all function calls from the response, look up the corresponding tool function(s) and execute them.
    (This would be a good place to handle asynchroneous tool calls, or ones that take a while to execute.)
    This returns a list of messages to be added to the conversation history.

    Parameters
    ----------
    response : OpenAI Response
        The response object from OpenAI containing output items that may include function calls
    tool_mapping : dict[str, Callable]
        A dictionary mapping function names (as strings) to their corresponding Python functions.
        Keys should match the function names defined in the tools schema.

    Returns
    -------
    list[dict]
        List of function call output messages formatted for the OpenAI conversation.
        Each message contains:
        - type: "function_call_output"
        - call_id: The unique identifier for the function call
        - output: The result returned by the executed function (string or error message)
    """
    intermediate_messages = []
    for response_item in response.output:
        if response_item.type == "function_call":
            target_tool = tool_mapping.get(response_item.name)
            if target_tool:
                try:
                    arguments = json.loads(response_item.arguments)
                    logger.info(
                        f"Invoking tool: {response_item.name} with arguments: {arguments}"
                    )
                    tool_output = target_tool(**arguments)
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