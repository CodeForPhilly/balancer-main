from openai import OpenAI
import os
import json


class openAIServices:
    @staticmethod
    def openAI(userMessage, prompt, model=None, temp=None, stream=False, raw_stream=False):
        if stream:
            return openAIServices._openAI_streaming(userMessage, prompt, model, temp, raw_stream)
        else:
            return openAIServices._openAI_non_streaming(userMessage, prompt, model, temp)

    @staticmethod
    def _openAI_non_streaming(userMessage, prompt, model=None, temp=None):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        if model is None:
            model = "gpt-4o-mini"
        if temp is None:
            temp = 0.2

        request_params = {
            "model": model,
            "temperature": temp,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": userMessage}
            ],
        }

        response = client.chat.completions.create(**request_params)
        message_content = response.choices[0].message.content
        print("OpenAI response content:", repr(message_content))

        if not message_content:
            raise ValueError("LLM returned empty content")

        return message_content

    @staticmethod
    def _openAI_streaming(userMessage, prompt, model=None, temp=None, raw_stream=False):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        if model is None:
            model = "gpt-4o-mini"
        if temp is None:
            temp = 0.2

        request_params = {
            "model": model,
            "temperature": temp,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": userMessage}
            ],
            "stream": True
        }

        response = client.chat.completions.create(**request_params)

        for chunk in response:
            if raw_stream:
                yield json.dumps(chunk.model_dump())
            else:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if hasattr(delta, 'content') and delta.content:
                        yield delta.content
