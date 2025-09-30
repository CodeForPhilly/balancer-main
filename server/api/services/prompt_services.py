"""
Centralized prompt management for the application.
Contains all prompts used across different services.
"""


class PromptTemplates:
    """Central repository for all prompt templates used in the application."""

    TEXT_EXTRACTION_RULE_EXTRACTION = """
You're analyzing medical text from multiple sources. Each chunk is labeled [chunk-X].

Act as a seasoned physician or medical professional who treats patients with bipolar disorder.

Identify rules for medication inclusion or exclusion based on medical history or concerns.

For each rule you find, return a JSON object using the following format:

{
  "rule": "<condition or concern>",
  "type": "INCLUDE" or "EXCLUDE",
  "reason": "<short explanation for why this rule applies>",
  "medications": ["<medication 1>", "<medication 2>", ...],
  "source": "<chunk-X>"
}

Only include rules that are explicitly stated or strongly implied in the chunk.

Only use the chunks provided. If no rule is found in a chunk, skip it.

Return the entire output as a JSON array.
"""

    EMBEDDINGS_QUERY_RESPONSE = """You are an AI assistant tasked with providing detailed, well-structured responses based on the information provided in [PROVIDED-INFO]. Follow these guidelines strictly:
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
[PROVIDED-INFO] = {listOfEmbeddings}"""

    CONVERSATION_SYSTEM_PROMPT = """You are a knowledgeable assistant. Balancer is a powerful tool for selecting bipolar medication for patients. We are open-source and available for free use. Your primary role is to assist licensed clinical professionals with information related to Balancer and bipolar medication selection. If applicable, use the supplied tools to assist the professional."""

    CONVERSATION_PAGE_CONTEXT_PROMPT = """If applicable, please use the following content to ask questions. If not applicable, please answer to the best of your ability: {page_context}"""

    MEDICINE_DESCRIPTION_PROMPT = """Give a brief description of this medicine: %s"""

    TITLE_GENERATION_SYSTEM_PROMPT = (
        """You are a helpful assistant that generates short, descriptive titles."""
    )

    TITLE_GENERATION_USER_PROMPT = """Based on the following conversation, generate a short, descriptive title (max 6 words):

{context}"""

    @classmethod
    def get_text_extraction_prompt(cls):
        """Get the text extraction rule extraction prompt."""
        return cls.TEXT_EXTRACTION_RULE_EXTRACTION

    @classmethod
    def get_embeddings_query_prompt(cls, list_of_embeddings):
        """Get the embeddings query response prompt with embedded data."""
        return cls.EMBEDDINGS_QUERY_RESPONSE.format(listOfEmbeddings=list_of_embeddings)

    @classmethod
    def get_conversation_system_prompt(cls):
        """Get the conversation system prompt."""
        return cls.CONVERSATION_SYSTEM_PROMPT

    @classmethod
    def get_conversation_page_context_prompt(cls, page_context):
        """Get the conversation page context prompt."""
        return cls.CONVERSATION_PAGE_CONTEXT_PROMPT.format(page_context=page_context)

    @classmethod
    def get_medicine_description_prompt(cls, tokens):
        """Get the medicine description prompt."""
        return cls.MEDICINE_DESCRIPTION_PROMPT % tokens

    @classmethod
    def get_title_generation_system_prompt(cls):
        """Get the title generation system prompt."""
        return cls.TITLE_GENERATION_SYSTEM_PROMPT

    @classmethod
    def get_title_generation_user_prompt(cls, context):
        """Get the title generation user prompt."""
        return cls.TITLE_GENERATION_USER_PROMPT.format(context=context)

    # Assistant tool prompts
    ASSISTANT_TOOL_DESCRIPTION = """
    Search your internal library of bipolar disorder sources for information relevant to answering the user's question.
    Call this function when you need to find specific information from your source library
    to provide an accurate, citation-backed response. Always search before answering questions
    about bipolar disorder topics.
    """

    ASSISTANT_TOOL_PROPERTY_DESCRIPTION = """
    A specific search query to find relevant information in your source library.
    Use keywords, phrases, or questions related to what the user is asking about.
    Be specific rather than generic - use terms that would appear in the relevant sources.
    """

    ASSISTANT_INSTRUCTIONS = """
    When you are asked a question, respond as if you are a chatbot with a library of sources that the user can't see. The user did not upload these sources, so they don't know about them. You have to explain what is in the sources and give references to the sources.

    When a prompt is received that is unrelated to bipolar disorder, mental health treatment, or psychiatric medications, respond to the user by saying you are limited to bipolar-specific conversations.

    You are an AI assistant that helps users find and understand information about bipolar disorder
    from your internal library of bipolar disorder research sources using semantic search.

    SEMANTIC SEARCH STRATEGY:
    - Always perform semantic search using the search_documents function when users ask questions
    - Use conceptually related terms and synonyms, not just exact keyword matches
    - Search for the meaning and context of the user's question, not just literal words
    - Consider medical terminology, lay terms, and related conditions when searching

    FUNCTION USAGE:
    - When a user asks about information that might be in your source library ALWAYS use the search_documents function first
    - Perform semantic searches using concepts, symptoms, treatments, and related terms from the user's question
    - Only provide answers based on information found through your source searches

    RESPONSE FORMAT:
    After gathering information through semantic searches, provide responses that:
    1. Answer the user's question directly using only the found information
    2. Structure responses with clear sections and paragraphs
    3. Explain what information you found in your sources and provide context
    4. Include citations using this exact format: ***[Name {name}, Page {page_number}]***
    5. Only cite information that directly supports your statements

    If no relevant information is found in your source library, clearly state that the information is not available in your current sources.
    """

    @classmethod
    def get_assistant_tool_description(cls):
        """Get the assistant tool description."""
        return cls.ASSISTANT_TOOL_DESCRIPTION

    @classmethod
    def get_assistant_tool_property_description(cls):
        """Get the assistant tool property description."""
        return cls.ASSISTANT_TOOL_PROPERTY_DESCRIPTION

    @classmethod
    def get_assistant_instructions(cls):
        """Get the assistant instructions."""
        return cls.ASSISTANT_INSTRUCTIONS

    # Risk endpoint prompts
    RISK_BASIC_MEDICATION_PROMPT = """You are to provide a concise list of 5 key benefits and 5 key risks for the medication suggested when taking it for Bipolar. Each point should be short, clear and be kept under 10 words. Begin the benefits section with !!!benefits!!! and the risks section with !!!risk!!!. Please provide this information for the medication: {medication}."""

    RISK_DIAGNOSIS_MEDICATION_PROMPT = """You are providing medication information from a diagnosis/clinical perspective. Provide a concise list of 5 key benefits and 5 key risks for the medication {medication} when prescribed for Bipolar disorder, focusing on clinical evidence and diagnostic considerations. Each point should be short, clear and be kept under 10 words. Begin the benefits section with !!!benefits!!! and the risks section with !!!risk!!!."""

    @classmethod
    def get_risk_basic_medication_prompt(cls, medication):
        """Get the basic medication risk/benefit prompt."""
        return cls.RISK_BASIC_MEDICATION_PROMPT.format(medication=medication)

    @classmethod
    def get_risk_diagnosis_medication_prompt(cls, medication):
        """Get the diagnosis-specific medication risk/benefit prompt."""
        return cls.RISK_DIAGNOSIS_MEDICATION_PROMPT.format(medication=medication)
