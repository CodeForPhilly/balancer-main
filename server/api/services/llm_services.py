"""
This module contains functions to interact with different AI models
"""

import os
import time
import logging
from abc import ABC, abstractmethod

import openai

class BaseModelHandler(ABC):
    @abstractmethod
    def handle_request(
        self, query: str, context: str
    ) -> tuple[str, dict[str, int], dict[str, float], float]:
        pass

# LLM Pricing Calculator: https://www.llm-prices.com/

 # Anthropic  Model Pricing: https://docs.anthropic.com/en/docs/about-claude/pricing#model-pricing

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
            temperature=0.0
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

    # GPT 4.1 Prompting Guide: https://cookbook.openai.com/examples/gpt4-1_prompting_guide

    # Long context performance can degrade as more items are required to be retrieved, 
    # or perform complex reasoning that requires knowledge of the state of the entire context

    #

    INSTRUCTIONS = """
        
    # Role and Objective
    
    - You are a seasoned physician or medical professional who is developing a bipolar disorder treatment algorithim

    - You are extracting bipolar medication decision points from a research paper that is chunked into multiple parts each labeled with an ID

    # Instructions

    - Identify decision points for bipolar medications #TODO: "pharmacological and procedurl interventions" 

    - For each decision point you find, return a JSON object using the following format:

        {
            "criterion": "<condition or concern>",
            "decision": "INCLUDE" or "EXCLUDE",
            "medications": ["<medication 1>", "<medication 2>", ...],
            "reason": "<short explanation for why this criterion applies>",
            "sources": ["<ID-X>"]
            "hierarchy": Primary: Contraindictions for allergies
            "override" Exclude for allergy
        }


    - Only extract bipolar medication decision points that are explicitly stated or strongly implied in the context and never rely on your own knowledge

    - TODO: Test against medication indication file 

    # Output Format

    - Return the extracted bipolar medication decision points as a JSON array and if no decision points are found in the context return an empty array

    # Example

    [
        {
            "criterion": "History of suicide attempts",
            "decision": "INCLUDE",
            "medications": ["Lithium"],
            "reason": "Lithium is the only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder",
            "sources": ["ID-0"]
        },
        {
            "criterion": "Weight gain concerns",
            "decision": "EXCLUDE",
            "medications": ["Quetiapine", "Aripiprazole", "Olanzapine", "Risperidone"],
            "reason": "Seroquel, Risperdal, Abilify, and Zyprexa are known for causing weight gain",
            "sources": ["ID-0", "ID-1", "ID-2"]
        }
    ]

    """

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

        # If no query is provided, use the default instructions
        if not query:
            query = self.INSTRUCTIONS


        start_time = time.time()
        # TODO: Add error handling for API requests and invalid responses

        response = self.client.responses.create(
            model=self.MODEL,
            instructions=query,
            input=context,
            temperature=0.0
        )
        duration = time.time() - start_time

        return (
            response.output_text,
            response.usage,
            self.PRICING_DOLLARS_PER_MILLION_TOKENS,
            duration,
        )


class ModelFactory:

    #TODO: Define structured fields to extract from unstructured input data
    #https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses&example=structured-data#examples


    HANDLERS = {
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
