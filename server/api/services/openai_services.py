import openai
import os


class openAIServices:
    def openAI(userMessage, prompt, model=None, temp=None):
        openai.api_key = os.getenv("OPEN_API_KEY")
        if model is None:
            model = "gpt-4o-mini"

        if temp is None:
            temp = 0.2

        response = openai.ChatCompletion.create(
            model,
            temperature=temp,
            message=[
                {"role": "system",
                 "content": prompt},
                {"role": "user", "content": userMessage}
            ]
        )
        return response
