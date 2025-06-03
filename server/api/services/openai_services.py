import openai
import os

class openAIServices:
    def prompt_with_context(self, context, prompt, model="gpt-4", temp=0.2):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        if openai.api_key is None:
            raise Exception("OPENAI_API_KEY is not set")

        response = openai.ChatCompletion.create(
            model=model,
            temperature=temp,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": context}
            ]
        )

        return response
