
def run_assistant():
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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


    MODEL_DEFAULTS = {
        "instructions": INSTRUCTIONS,
        "model": "gpt-5-nano",  # 400,000 token context window
        # A summary of the reasoning performed by the model. This can be useful for debugging and understanding the model's reasoning process.
        "reasoning": {"effort": "low", "summary": None},
        "tools": tools,
    }

    # We fetch a response and then kick off a loop to handle the response



    # TODO: Track total duration, cost metrics, and tool_calls_made count
    # and return them from run_assistant for use in eval_assistant.py CSV output

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

    
    
    final_response_output_text, final_response_id = handle_tool_calls_with_reasoning()



