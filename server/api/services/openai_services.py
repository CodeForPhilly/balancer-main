from openai import OpenAI
import os
import json


class openAIServices:
    @staticmethod
    def openAI(userMessage, prompt, model=None, temp=None, stream=False, raw_stream=False):
        # Initialize the OpenAI client
        try:
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

            if model is None:
                model = "gpt-4o-mini"
            if temp is None:
                temp = 0.2

            if stream:

                request_params = {
                    "model": model,
                    "temperature": temp,
                    "messages": [
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": userMessage}
                    ],
                    "stream": stream
                }
                response = client.chat.completions.create(**request_params)

                for chunk in response:
                    if raw_stream:
                        # Return the entire chunk as JSON
                        yield json.dumps(chunk.model_dump())
                    else:
                        # Extract only the content from the delta
                        if chunk.choices and len(chunk.choices) > 0:
                            delta = chunk.choices[0].delta
                            if hasattr(delta, 'content') and delta.content:
                                yield delta.content
            else:
                request_params = {
                    "model": model,
                    "temperature": temp,
                    "messages": [
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": userMessage}
                    ],
                }
                response = client.chat.completions.create(**request_params)
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error: {e}")
            raise
