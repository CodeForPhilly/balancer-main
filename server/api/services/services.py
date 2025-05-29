


def claude_citations(client, user_prompt, content_chunks): 


    # Model Pricing: https://docs.anthropic.com/en/docs/about-claude/pricing#model-pricing
    
    CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS = {'input': 0.80, 
                                                           'output': 4.00,}

    # Calculcate latency
    import time
    start_time = time.time()
    # Create the message with citations enabled
    # Note: The model "claude-3-5-haiku-20241022" is used for citations 
    message = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "content",
                            "content": content_chunks
                        },
                        "citations": {"enabled": True}
                    },

                    {
                        "type": "text",
                        "text": user_prompt
                    }
                ]
            }
        ],
    )
    latency = time.time() - start_time
    

    # Response Structure: https://docs.anthropic.com/en/docs/build-with-claude/citations#response-structure

    text = []
    cited_text = []
    for content in message.to_dict()['content']:
        text.append(content['text'])
        if 'citations' in content.keys():
            text.append(" ".join([f"<{citation['start_block_index']} - {citation['end_block_index']}>" for citation in content['citations']]))
            cited_text.append(" ".join([f"<{citation['start_block_index']} - {citation['end_block_index']}> {citation['cited_text']}" for citation in content['citations']]))

    texts = " ".join(text)
    cited_texts = " ".join(cited_text)



    return texts, message.usage, CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS, latency


def gpt_4o_mini(client, user_prompt, content_chunks):    

    # Model Pricing: https://platform.openai.com/docs/pricing
    GPT_4O_MINI_PRICING_DOLLARS_PER_MILLION_TOKENS = {'input': 0.15,
                                                      'output': 0.60,}

    # Calculate latency
    import time
    start_time = time.time()
    # Create the response using the GPT-4o-mini model 
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=user_prompt,
        input=content_chunks,
    )
    latency = time.time() - start_time
    # Note: The model "gpt-4o-mini" is used for the function call

    return response.output_text, response.usage, GPT_4O_MINI_PRICING_DOLLARS_PER_MILLION_TOKENS, latency