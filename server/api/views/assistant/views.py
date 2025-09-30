import os
import json
import logging
import time
from typing import Callable

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from openai import OpenAI

from ...services.embedding_services import get_closest_embeddings
from ...services.conversions_services import convert_uuids
from ...services.prompt_services import PromptTemplates

# Configure logging
logger = logging.getLogger(__name__)

GPT_5_NANO_PRICING_DOLLARS_PER_MILLION_TOKENS = {"input": 0.05, "output": 0.40}


def calculate_cost_metrics(token_usage: dict, pricing: dict) -> dict:
    """
    Calculate cost metrics based on token usage and pricing

    Args:
        token_usage: Dictionary containing input_tokens and output_tokens
        pricing: Dictionary containing input and output pricing per million tokens

    Returns:
        Dictionary containing input_cost, output_cost, and total_cost in USD
    """
    TOKENS_PER_MILLION = 1_000_000

    # Pricing is in dollars per million tokens
    input_cost_dollars = (pricing["input"] / TOKENS_PER_MILLION) * token_usage.get(
        "input_tokens", 0
    )
    output_cost_dollars = (pricing["output"] / TOKENS_PER_MILLION) * token_usage.get(
        "output_tokens", 0
    )
    total_cost_dollars = input_cost_dollars + output_cost_dollars

    return {
        "input_cost": input_cost_dollars,
        "output_cost": output_cost_dollars,
        "total_cost": total_cost_dollars,
    }


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


@method_decorator(csrf_exempt, name="dispatch")
class Assistant(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user

            client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

            TOOL_DESCRIPTION = PromptTemplates.get_assistant_tool_description()
            TOOL_PROPERTY_DESCRIPTION = PromptTemplates.get_assistant_tool_property_description()

            tools = [
                {
                    "type": "function",
                    "name": "search_documents",
                    "description": TOOL_DESCRIPTION,
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": TOOL_PROPERTY_DESCRIPTION,
                            }
                        },
                        "required": ["query"],
                    },
                }
            ]

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

            INSTRUCTIONS = PromptTemplates.get_assistant_instructions()

            MODEL_DEFAULTS = {
                "instructions": INSTRUCTIONS,
                "model": "gpt-5-nano",  # 400,000 token context window
                "reasoning": {"effort": "low", "summary": "auto"},
                "tools": tools,
            }

            # We fetch a response and then kick off a loop to handle the response

            message = request.data.get("message", None)
            previous_response_id = request.data.get("previous_response_id", None)

            # Track total duration and cost metrics
            start_time = time.time()
            total_token_usage = {"input_tokens": 0, "output_tokens": 0}

            if not previous_response_id:
                response = client.responses.create(
                    input=[
                        {"type": "message", "role": "user", "content": str(message)}
                    ],
                    **MODEL_DEFAULTS,
                )
            else:
                response = client.responses.create(
                    input=[
                        {"type": "message", "role": "user", "content": str(message)}
                    ],
                    previous_response_id=str(previous_response_id),
                    **MODEL_DEFAULTS,
                )

            # Accumulate token usage from initial response
            if hasattr(response, "usage"):
                total_token_usage["input_tokens"] += getattr(
                    response.usage, "input_tokens", 0
                )
                total_token_usage["output_tokens"] += getattr(
                    response.usage, "output_tokens", 0
                )

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
                    # Accumulate token usage from reasoning iterations
                    if hasattr(response, "usage"):
                        total_token_usage["input_tokens"] += getattr(
                            response.usage, "input_tokens", 0
                        )
                        total_token_usage["output_tokens"] += getattr(
                            response.usage, "output_tokens", 0
                        )

            # Calculate total duration and cost metrics
            total_duration = time.time() - start_time
            cost_metrics = calculate_cost_metrics(
                total_token_usage, GPT_5_NANO_PRICING_DOLLARS_PER_MILLION_TOKENS
            )

            # Log cost and duration metrics
            logger.info(
                f"Request completed: "
                f"Duration: {total_duration:.2f}s, "
                f"Input tokens: {total_token_usage['input_tokens']}, "
                f"Output tokens: {total_token_usage['output_tokens']}, "
                f"Total cost: ${cost_metrics['total_cost']:.6f}"
            )

            return Response(
                {
                    "response_output_text": final_response_output_text,
                    "final_response_id": final_response_id,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error in Assistant view for user {request.user.id if hasattr(request, 'user') else 'unknown'}: {e}",
                exc_info=True,
            )
            return Response(
                {"error": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
