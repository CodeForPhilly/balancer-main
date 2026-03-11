"""
This module contains functions to interact with different AI models
"""

import os
import time
import logging
from abc import ABC, abstractmethod

from openai import AsyncOpenAI
from .prompt_services import LLM_EXTRACTION_INSTRUCTIONS


class BaseModelHandler(ABC):
    @abstractmethod
    async def handle_request(
        self, query: str, context: str
    ) -> tuple[str, dict[str, int], dict[str, float], float]:
        pass


# LLM Pricing Calculator: https://www.llm-prices.com/
# TODO: Add support for more models and their pricing

# Anthropic  Model Pricing: https://docs.anthropic.com/en/docs/about-claude/pricing#model-pricing


class GPT4OMiniHandler(BaseModelHandler):
    MODEL = "gpt-4o-mini"
    # TODO: Get the latest model pricing from OpenAI's API or documentation
    # Model Pricing: https://platform.openai.com/docs/pricing
    PRICING_DOLLARS_PER_MILLION_TOKENS = {"input": 0.15, "output": 0.60}

    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    async def handle_request(
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
        response = await self.client.responses.create(
            model=self.MODEL, instructions=query, input=context, temperature=0.0
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

    INSTRUCTIONS = LLM_EXTRACTION_INSTRUCTIONS

    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    async def handle_request(
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

        response = await self.client.responses.create(
            model=self.MODEL, instructions=query, input=context, temperature=0.0
        )
        duration = time.time() - start_time

        return (
            response.output_text,
            response.usage,
            self.PRICING_DOLLARS_PER_MILLION_TOKENS,
            duration,
        )


class ModelFactory:
    # TODO: Define structured fields to extract from unstructured input data
    # https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses&example=structured-data#examples

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
