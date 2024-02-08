from django.http import JsonResponse #look here erin
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer
import requests
import openai
import tiktoken
import os
import json
import spacy

nlp = spacy.load("en_core_web_sm")

prompt_templates = {
    'ORG': "Would you like to know more about {entity}?",
    'GPE': "Interested in more details about {entity}?"
}

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt
openai.api_key = os.environ.get("OPENAI_API_KEY")

@csrf_exempt
def chatgpt(request):
    data = json.loads(request.body)

    if data is not None:
        user_input: str = data["prompt"]
        ai_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Balancer is a powerful tool... Conversation: {user_input}." }
            ]
        )

        dynamic_prompts = get_dynamic_prompts(ai_response)
        dynamic_prompt = dynamic_prompts[0] if dynamic_prompts else "No further questions suggested."
        response_data ={
            "message": ai_response.choices[0].message['content'],
            "newPrompt": dynamic_prompt
        }

        return JsonResponse(response_data)

    return JsonResponse({"error": "Failed to retrieve results fromchatGPT"})


@csrf_exempt
def get_dynamic_prompts(ai_response):  #look here erin
  ai_text = ai_response['choices'][0]['message']['content']
  doc = nlp(ai_text)
  # entities = [ent.label_ for ent in  doc.ents]
  prompts = []


  for ent in doc.ents:
        if ent.label_ in prompt_templates:
            prompts.append(prompt_templates[ent.label_].format(entity=ent.text))
            break
  return prompts

@csrf_exempt
def get_entities_from_chatgpt(text):
    try:
      response = openai.ChatCompletion.create(
          model="gpt-4",
          messages=[{"role":"system", "content": "Identify and list the main entities in the following text."},
                    {"role": "user", "content":text }
                    ]
      )
      return parse_entites_from_response(response)
    except Exception as e:
      print(f"Error in get_entities_from_chatgpt: {e}")
      return[]

@csrf_exempt
def parse_entites_from_response(response):
    entites = []
    try:
        response_text=response.choices[0].messages.content
        return entities
    except Exception as e:
        print(f"Error in get_entities_from_chatgpt: {e}")
        return []

@csrf_exempt
def create_dynamic_prompts(entities):
    prompts = []
    for entity in entities:
        prompts.extend([
            f" Tell me more about {entity}.",
            f"What is the signficance of {entity}?",
            f"How does {entity} impact the current context?"
        ])
    return prompts

@csrf_exempt
def chatgpt_with_dynamic_prompts(request):
    data = json.loads(request.body)
    if data is not None:
        user_input = data.get("prompt","")
        entites = get_entites_from_chatgpt(user_input)
        dynamic_prompts = create_dynamic_prompts(entites)

        response_data = {
            "entities": entities,
            "dymaicPrompts":dynamic_prompts
        }
        return JsonResponse(response_data)
    else:
        return JsonResponse({"error": "Invalid request"}, status = 400)

@csrf_exempt
def extract_text(request: str) -> JsonResponse:
    """
    Takes a URL and returns a summary of page's text content.

    Currently only uses the first 3500 tokens.
    """
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data = json.loads(request.body)
    webpage_url = data["webpage_url"]

    response = requests.get(webpage_url)
    soup = BeautifulSoup(response.text, "html.parser")
    text_contents = soup.find_all("p")
    text_contents = [p.get_text() for p in text_contents]
    text_contents = " ".join(text_contents)

    stemmer = PorterStemmer()
    text_contents = text_contents.split()
    text_contents = [stemmer.stem(word) for word in text_contents]
    text_contents = " ".join(text_contents)

    tokens = get_tokens(text_contents, "cl100k_base")

    ai_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "Give a brief description of this medicine: %s" % tokens,
            }
        ],
        max_tokens=500,
    )

    return JsonResponse({"message": ai_response})


def get_tokens(string: str, encoding_name: str) -> str:
    """Tokenize the first 3500 tokens of a string."""
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(string)
    tokens = tokens[:3500]
    output_string = encoding.decode(tokens)
    return output_string


@csrf_exempt
def diagnosis(request: str) -> JsonResponse:
    """Takes a diagnosis and returns a table of the most commonly prescribed medications for that diagnosis."""
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data = json.loads(request.body)

    if data is not None:
        diagnosis = data["diagnosis"]

        ai_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """Please provide a table of the most commonly prescribed medications for %s. 
                    The table should be in HTML format, without any <head> tags. It should have a maximum width 
                    of 630px, with a margin of 0 for the top and bottom. The table should consist of two columns: 
                    'Medication Class' and 'Medication Names'. Each cell should have a left padding and a border, 
                    and the text in the 'Medication Class' and 'Medications' cells should be displayed in bold. 
                    No other cells should be bold."""
                    % diagnosis,
                }
            ],
            max_tokens=4000,
        )

        response_data = {"message": ai_response}
        return JsonResponse(response_data)

    # Handle the case when data is None
    return JsonResponse({"error": "Invalid request"})