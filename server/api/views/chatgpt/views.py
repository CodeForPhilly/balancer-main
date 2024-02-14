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
text = "Your example text here."
doc = nlp(text)



prompt_templates = {
    'ORG': "Would you like to know more about {entity}?",
    'GPE': "Interested in more details about {entity}?",
    'PERSON': "Would you like to learn more about {entity} and their contributions?",
    'DATE': "Do you want information on events that happened around {entity}?"
}

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt
openai.api_key = os.environ.get("OPENAI_API_KEY")

@csrf_exempt
def chatgpt(request):  # Handle Request And Generate ChatGpt Response
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
def get_dynamic_prompts(ai_response): #Generate Dynamic Prompts Based On Entities
    ai_text = ai_response['choices'][0]['message']['content']
    doc = nlp(ai_text)
    prompts = []

    logger.info(f"Processing text: {ai_text}")
    for ent in doc.ents:
        logger.info(f"Detected entity: '{ent.text}' of type '{ent.label_}'")
        if ent.label_ in prompt_templates:
            prompt = prompt_templates[ent.label_].format(entity=ent.text)
            prompts.append(prompt)
            logger.info(f"Generated prompt: {prompt}")

    if not prompts:
        logger.warning("No matching entities found for dynamic prompts.")
    return prompts


@csrf_exempt
def get_entities_from_chatgpt(text): #Get Entities From ChatGpt
    try:
      response = openai.ChatCompletion.create(
          model="gpt-4",
          messages=[{"role":"system", "content": "Identify and list the main entities in the following text."},
                    {"role": "user", "content":text }
                    ]
      )
      return parse_entities_from_response(response)
    except Exception as e:
      print(f"Error in get_entities_from_chatgpt: {e}")
      return[]

@csrf_exempt
def parse_entities_from_response(response): #Parse Entities From ChatGpt
    entities = []
    try:
        response_text=response.choices[0].messages.content
        return entities
    except Exception as e:
        print(f"Error in get_entities_from_chatgpt: {e}")
        return []

@csrf_exempt
def create_dynamic_prompts(entities):   #Create Dynamic Prompts
    prompts = []
    for entity in entities:
        prompts.extend([
            f" Tell me more about {entity}.",
            f"What is the signficance of {entity}?",
            f"How does {entity} impact the current context?"
        ])
    return prompts

@csrf_exempt
def chatgpt_with_dynamic_prompts(request): # Handle Request And Generate ChatGpt Response
    if request.method == 'POST':
        data = json.loads(request.body)
        user_input = data.get('prompt', '')
        
        chat_resposne, dynamic_prompts = process_chat_input(user_input)
        
        response_data = {
          "message": chat_resposne,
          "dynamicPrompts": dynamic_prompts
        }
        return JsonResponse(response_data)
    return JsonResponse({"error":"Invalid request"}, status=400)

def process_chat_input(user_input):
    chat_response = " Simulated response from chatGPT based on user input"
    dynamic_prompts = ["Prompt 1", "Prompt 2", "Prompt 3"]
    return chat_response, dynamic_prompts

@csrf_exempt
def extract_text(request: str) -> JsonResponse: # Handle Request And Generate ChatGpt Response
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


def get_tokens(string: str, encoding_name: str) -> str: # Tokenize
    """Tokenize the first 3500 tokens of a string."""
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(string)
    tokens = tokens[:3500]
    output_string = encoding.decode(tokens)
    return output_string


@csrf_exempt
def diagnosis(request: str) -> JsonResponse: # Handle Request And Generate ChatGpt Response
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