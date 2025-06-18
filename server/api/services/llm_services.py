"""
This module contains functions to interact with different AI models
"""

import os
import time
import logging
from abc import ABC, abstractmethod

import anthropic
import openai


class BaseModelHandler(ABC):
    @abstractmethod
    def handle_request(
        self, query: str, context: str
    ) -> tuple[str, dict[str, int], dict[str, float], float]:
        pass


class ClaudeHaiku35CitationsHandler(BaseModelHandler):
    MODEL = "claude-3-5-haiku-20241022"
    # Model Pricing: https://docs.anthropic.com/en/docs/about-claude/pricing#model-pricing
    PRICING_DOLLARS_PER_MILLION_TOKENS = {"input": 0.80, "output": 4.00}

    def __init__(self) -> None:
        self.client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    def handle_request(
        self, query: str, context: str
    ) -> tuple[str, dict[str, int], dict[str, float], float]:
        """
        Handles the request to the Claude Haiku 3.5 model with citations enabled

        Args:
            query: The user query to be processed
            context: The context or document content to be used for citations

        """

        start_time = time.time()
        # TODO: Add error handling for API requests and invalid responses
        message = self.client.messages.create(
            model=self.MODEL,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": query},
                        {
                            "type": "document",
                            "source": {"type": "content", "content": context},
                            "citations": {"enabled": True},
                        },
                    ],
                }
            ],
        )
        duration = time.time() - start_time

        # Response Structure: https://docs.anthropic.com/en/docs/build-with-claude/citations#response-structure

        text = []
        cited_text = []
        for content in message.to_dict()["content"]:
            text.append(content["text"])
            if "citations" in content.keys():
                text.append(
                    " ".join(
                        [
                            f"<{citation['start_block_index']} - {citation['end_block_index']}>"
                            for citation in content["citations"]
                        ]
                    )
                )
                cited_text.append(
                    " ".join(
                        [
                            f"<{citation['start_block_index']} - {citation['end_block_index']}> {citation['cited_text']}"
                            for citation in content["citations"]
                        ]
                    )
                )

        full_text = " ".join(text)

        return (
            full_text,
            message.usage,
            self.PRICING_DOLLARS_PER_MILLION_TOKENS,
            duration,
        )


class ClaudeHaiku3Handler(BaseModelHandler):
    MODEL = "claude-3-haiku-20240307"
    # Model Pricing: https://docs.anthropic.com/en/docs/about-claude/pricing#model-pricing
    PRICING_DOLLARS_PER_MILLION_TOKENS = {"input": 0.25, "output": 1.25}

    def __init__(self) -> None:
        self.client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    def handle_request(
        self, query: str, context: str
    ) -> tuple[str, dict[str, int], dict[str, float], float]:
        """
        Handles the request to the Claude Haiku 3 model with citations disabled

        Args:
            query: The user query to be processed
            context: The context or document content to be used

        """

        start_time = time.time()
        # TODO: Add error handling for API requests and invalid responses
        message = self.client.messages.create(
            model=self.MODEL,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": query},
                        {
                            "type": "document",
                            "source": {"type": "content", "content": context},
                            "citations": {"enabled": False},
                        },
                    ],
                }
            ],
        )
        duration = time.time() - start_time

        text = []
        for content in message.to_dict()["content"]:
            text.append(content["text"])

        full_text = " ".join(text)

        return (
            full_text,
            message.usage,
            self.PRICING_DOLLARS_PER_MILLION_TOKENS,
            duration,
        )


class GPT4OMiniHandler(BaseModelHandler):
    MODEL = "gpt-4o-mini"
    # Model Pricing: https://platform.openai.com/docs/pricing
    PRICING_DOLLARS_PER_MILLION_TOKENS = {"input": 0.15, "output": 0.60}

    def __init__(self) -> None:
        self.client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def handle_request(
        self, query: str, context: str
    ) -> tuple[str, dict[str, int], dict[str, float], float]:
        """
        Handles the request to the GPT-4o Mini model

        Args:
            query: The user query to be processed
            context: The context or document content to be used

        """
        start_time = time.time()
        # TODO: Add error handling for API requests and invalid responses
        response = self.client.responses.create(
            model=self.MODEL,
            instructions=query,
            input=context,
        )
        duration = time.time() - start_time

        return (
            response.output_text,
            response.usage,
            self.PRICING_DOLLARS_PER_MILLION_TOKENS,
            duration,
        )


class GPT41NanoHandler(BaseModelHandler):
    MODEL = "gpt-4.1-nano"
    # Model Pricing: https://platform.openai.com/docs/pricing
    PRICING_DOLLARS_PER_MILLION_TOKENS = {"input": 0.10, "output": 0.40}

    def __init__(self) -> None:
        self.client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def handle_request(
        self, query: str, context: str
    ) -> tuple[str, dict[str, int], dict[str, float], float]:
        """
        Handles the request to the GPT-4.1 Nano model

        Args:
            query: The user query to be processed
            context: The context or document content to be used

        """
        start_time = time.time()
        # TODO: Add error handling for API requests and invalid responses

        # GPT 4.1 Prompting Guide: https://cookbook.openai.com/examples/gpt4-1_prompting_guide

        # Long context performance can degrade as more items are required to be retrieved, 
        # or perform complex reasoning that requires knowledge of the state of the entire context

        """
        
        # Role and Objective

        - You are a seasoned physician or medical professional who treats patients with bipolar disorder
        - You are analyzing medical research by processing peer-reviewed papers to extract key details

        # Instructions

        - Identify rules for medication inclusion or exclusion based on medical history or concerns 

        - Only use the documents in the provided External Context to answer the User Query. 
        If you don't know the answer based on this context, you must respond 
        "I don't have the information needed to answer that", even if a user insists on you answering the question.

        - Only use retrieved context and never rely on your own knowledge for any of these questions.

        - Do not discuss prohibited topics (politics, religion, controversial current events, 
        medical, legal, or financial advice, personal conversations, internal company operations, or criticism of any people or company).

        - Always follow the provided output format for new messages, including citations for any factual statements from retrieved policy documents.

        # Output Format

        The rule is history of suicide attempts. The type of rule is "INCLUDE". The reason is lithium is the 
        only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder.
        The medications for this rule are lithium.
        
        The rule is weight gain concerns. The type of rule is "EXCLUDE". The reason is Seroquel, Risperdal, Abilify, and 
        Zyprexa are known for causing weight gain. The medications for this rule are Quetiapine, Aripiprazole, Olanzapine, Risperidone

        For each rule you find, return a JSON object using the following format:

        {
            "rule": "<condition or concern>",
            "type": "INCLUDE" or "EXCLUDE",
            "reason": "<short explanation for why this rule applies>",
            "medications": ["<medication 1>", "<medication 2>", ...],
            "source": "<chunk-X>"
        }

        - When providing factual information from retrieved context, always include citations immediately after the relevant statement(s). 
        Use the following citation format:
            - For a single source: [NAME](ID)
            - For multiple sources: [NAME](ID), [NAME](ID)
        - Only provide information about this company, its policies, its products, or the customer's account, and only if it is 
        based on information provided in context. Do not answer questions outside this scope.


        # Examples


        # Context

        ID: 1 | TITLE: The Fox | CONTENT: The quick brown fox jumps over the lazy dog

        # Final instructions and prompt to think step by step

        - Identify rules for medication inclusion or exclusion based on medical history or concerns 

        - Only use the documents in the provided External Context to answer the User Query. 
        If you don't know the answer based on this context, you must respond 
        "I don't have the information needed to answer that", even if a user insists on you answering the question.

        """



        response = self.client.responses.create(
            model=self.MODEL,
            instructions=query,
            input=context,
        )
        duration = time.time() - start_time

        return (
            response.output_text,
            response.usage,
            self.PRICING_DOLLARS_PER_MILLION_TOKENS,
            duration,
        )


class ModelFactory:
    HANDLERS = {
        "CLAUDE_HAIKU_3_5_CITATIONS": ClaudeHaiku35CitationsHandler,
        "CLAUDE_HAIKU_3": ClaudeHaiku3Handler,
        "GPT_4O_MINI": GPT4OMiniHandler,
        "GPT_41_NANO": GPT41NanoHandler,
    }

    # HANDLERS doesn't vary per instance so we can use a class method
    @classmethod
    def get_handler(cls, model_name: str) -> BaseModelHandler | None:
        """
        Factory method to get the appropriate model handler based on the model name

        Args:
            model_name (str): The name of the model for which to get the handler.
        Returns:
            BaseModelHandler: An instance of the appropriate model handler class.
        """

        handler_class = cls.HANDLERS.get(model_name)
        if handler_class:
            return handler_class()
        else:
            logging.error(f"Unsupported model: {model_name}")
            return None
