import os

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import openai

from api.models.model_embeddings import Embeddings

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