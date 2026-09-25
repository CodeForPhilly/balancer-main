from dataclasses import dataclass
from enum import Enum
from typing import Callable

@dataclass(frozen=True)
class Tool:
    """
    Instances are registered in tool_services.py's TOOLS list.
    """
    name: str
    description: str
    parameters: dict
    # Function we run: run(user, **arguments) -> str. 
    # Every tool takes the request `user` so the dispatch loop can call them uniformly; 
    # A tool that doesn't need it simply ignores it.
    run: Callable

    # Schema that the model sees:  Flattened Responses-API shape
    def schema(self) -> dict:
        return {
            "type": "function",
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
        }


class ToolCallStatus(str, Enum):
    """
    Evaluate tool selection and distinguish between FAILED and UNREGISTERED
    """

    OK = "ok"
    # Tool matched but raised an error 
    FAILED = "failed"
    # No tool registered for the model's requested name:
    # The model asked for a tool name we don't have    
    UNREGISTERED = "unregistered"  


@dataclass(frozen=True)
class ToolCallExecution:
    """
    A record of one tool call the model made
    """
    
    name: str
    # `output` and `error` are disjoint by status
    status: ToolCallStatus
    # the query the model generated (the primary tool selection signal)
    # None only when the model's argument JSON could not be parsed
    arguments: dict | None = None   
    # the tool's result on success (retrieved content)
    output: str | None = None
    # the failure detail when status is not OK    
    error: str | None = None        

@dataclass(frozen=True)
class TokenUsage:
    """
    Token usage for one responses.create call

    Every count is int | None, where None means unknown because response.usage
    was missing, and 0 means no tokens were used

    There is no total_tokens field: it is input_tokens + output_tokens
    """

    input_tokens: int | None
    # A subset of input_tokens
    # Every iteration resends the context via previous_response_id
    cached_input_tokens: int | None
    output_tokens: int | None
    # A subset of output_tokens
    reasoning_output_tokens: int | None

@dataclass(frozen=True)
class AgentResult:
    """
    # Built by the agentic loop as a run proceeds, 
    # and read by eval_assistant.py to fill the result CSV
    """

    # The model's final text
    output_text: str
    # The id of the final response (for multi-turn continuity)
    response_id: str
    # The ordered ToolCallExecution records for every tool invocation across all loop iterations
    tool_calls: list[ToolCallExecution]
    # One per loop iteration.
    # The eval sums these into its total_*_tokens columns
    token_usages: list[TokenUsage]
