import os

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import openai
import anthropic

from api.models.model_embeddings import Embeddings


# TODO: Add docstrings and type hints
def anthropic_citations(client, content_chunks, user_prompt): 
    """
    """

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

    
    # Response Structure: https://docs.anthropic.com/en/docs/build-with-claude/citations#response-structure
            
    text = []
    cited_text = []
    for content in message.to_dict()['content']:
        text.append(content['text'])
        if 'citations' in content.keys():
            cited_text.append(" ".join([citation['cited_text'] for citation in content['citations']]))
    
    texts = " ".join(text)
    cited_texts = " ".join(cited_text)

    return texts, cited_texts


@method_decorator(csrf_exempt, name='dispatch')
class TextExtractionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            guid = request.query_params.get('guid')
            field = request.query_params.get('field')

            query = Embeddings.objects.filter(upload_file__guid=guid)

            #TODO: Message OpenAI with each chunk separately if there are files that are too large for OpenAI

            query_texts = [
                f"[Start of INFO === GUID: {obj.upload_file.guid}, Page Number: {obj.page_num}, Chunk Number: {obj.chunk_number}, Text: {obj.text} === End of INFO]" 
                for obj in query]

            query_text = " ".join(query_texts)

            prompt_text = (
                f"""You are an AI assistant tasked with providing detailed, well-structured responses based on the information provided in [PROVIDED-INFO]. Follow these guidelines strictly: 
                1. Content: Use information contained within [PROVIDED-INFO] to answer the question. 
                2. Organization: Structure your response with clear sections and paragraphs. 
                3. Citations: After EACH sentence that uses information from [PROVIDED-INFO], include a citation in this exact format:***[{{file_id}}], Page {{page_number}}, Chunk {{chunk_number}}*** . Only use citations that correspond to the information you're presenting. 
                4. Clarity: Ensure your answer is well-structured and easy to follow. 
                5. Direct Response: Answer the user's question directly without unnecessary introductions or filler phrases. 
                Here's an example of the required response format:
                ________________________________________ 
                See's Candy in the context of sales during a specific event. The candy counters rang up 2,690 individual sales on a Friday, and an additional 3,931 transactions on a Saturday ***[16s848as-vcc1-85sd-r196-7f820a4s9de1, Page 5, Chunk 26]***.
                People like the consumption of fudge and peanut brittle the most ***[130714d7-b9c1-4sdf-b146-fdsf854cad4f, Page 9, Chunk 19]***. 
                Here is the history of See's Candy: the company was purchased in 1972, and its products have not been materially altered in 101 years ***[895sdsae-b7v5-416f-c84v-7f9784dc01e1, Page 2, Chunk 13]***. 
                Bipolar disorder treatment often involves mood stabilizers. Lithium is a commonly prescribed mood stabilizer effective in reducing manic episodes ***[b99988ac-e3b0-4d22-b978-215e814807f4, Page 29, Chunk 122]***. For acute hypomania or mild to moderate mania, initial treatment with risperidone or olanzapine monotherapy is suggested ***[b99988ac-e3b0-4d22-b978-215e814807f4, Page 24, Chunk 101]***. 
                ________________________________________ 
                Please provide your response to the user's question following these guidelines precisely.
                [PROVIDED-INFO] = {query_text}"""
            )


            openai.api_key = os.getenv("OPENAI_API_KEY")
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                temperature=0.2,
                messages=[{"role": "system", "content": prompt_text}, 
                          {"role": "user", "content": f"List out the {field}"}
                ]
            )

            answer = response["choices"][0]["message"]["content"]

            return Response({
                "query":  query_text,
                "answer": answer
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@method_decorator(csrf_exempt, name='dispatch')
class RuleExtractionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:

            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            
            user_prompt = """
            I'm creating a system to analyze medical research. It processes peer-reviewed papers to extract key details

            Act as a seasoned physician or medical professional who treat patients with bipolar disorder

            Identify rules for medication inclusion or exclusion based on medical history or concerns 

            Return an output with the same structure as these examples:

            The rule is history of suicide attempts. The type of rule is "INCLUDE". The reason is lithium is the 
            only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder.
            The medications for this rule are lithium.

            The rule is weight gain concerns. The type of rule is "EXCLUDE". The reason is Seroquel, Risperdal, Abilify, and 
            Zyprexa are known for causing weight gain. The medications for this rule are Quetiapine, Aripiprazole, Olanzapine, Risperidone
            }
            """

            guid = request.query_params.get('guid')

            query = Embeddings.objects.filter(upload_file__guid=guid)

            chunks = [{"type": "text", "text": chunk.text} for chunk in query]

            texts, cited_texts = anthropic_citations(client, chunks, user_prompt)


            return Response({"texts": texts, "cited_texts": cited_texts}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)