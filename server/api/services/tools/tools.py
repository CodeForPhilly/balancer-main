from django.db import connection
from typing import Dict, Any, Callable, List
from dataclasses import dataclass
from .database import ask_database, get_database_info
from ..prompt_services import TOOL_SQL_QUERY_DESCRIPTION, TOOL_SQL_QUERY_PARAM_DESCRIPTION_TEMPLATE

database_schema_dict = get_database_info(connection)
database_schema_string = "\n".join(
    [
        f"Table: {table['table_name']}\nColumns: {', '.join(table['column_names'])}"
        for table in database_schema_dict
    ]
)

@dataclass
class ToolFunction:
    name: str
    func: Callable
    description: str
    parameters: Dict[str, Any]

def create_tool_dict(tool: ToolFunction) -> Dict[str, Any]:
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description,
            "parameters": {
                "type": "object",
                "properties": tool.parameters,
                "required": list(tool.parameters.keys()),
            }
        }
    }

TOOL_FUNCTIONS = [
    ToolFunction(
        name="ask_database",
        func=ask_database,
        description=TOOL_SQL_QUERY_DESCRIPTION,
        parameters={
            "query": {
                "type": "string",
                "description": TOOL_SQL_QUERY_PARAM_DESCRIPTION_TEMPLATE.format(
                    database_schema_string=database_schema_string
                )
            }
        }
    ),
]

# Automatically generate the tool_functions dictionary and tools list
tool_functions: Dict[str, Callable] = {
    tool.name: tool.func for tool in TOOL_FUNCTIONS
}

tools: List[Dict[str, Any]] = [
    create_tool_dict(tool) for tool in TOOL_FUNCTIONS
]

def validate_tool_inputs(tool_function_name, tool_arguments):
    """Validate the inputs for the execute_tool function."""
    if not isinstance(tool_function_name, str) or not tool_function_name:
        raise ValueError("Invalid tool function name")
    
    if not isinstance(tool_arguments, dict):
        raise ValueError("Tool arguments must be a dictionary")
    
    # Check if the tool_function_name exists in the tools
    tool = next((t for t in tools if t["function"]["name"] == tool_function_name), None)
    if not tool:
        raise ValueError(f"Tool function '{tool_function_name}' does not exist")
    
    # Validate the tool arguments based on the tool's parameters
    parameters = tool["function"].get("parameters", {})
    required_params = parameters.get("required", [])
    for param in required_params:
        if param not in tool_arguments:
            raise ValueError(f"Missing required parameter: {param}")
    
    # Check if the parameter types match the expected types
    properties = parameters.get("properties", {})
    for param, prop in properties.items():
        expected_type = prop.get('type')
        if param in tool_arguments:
            if expected_type == 'string' and not isinstance(tool_arguments[param], str):
                raise ValueError(f"Parameter '{param}' must be of type string")
            
def execute_tool(function_name: str, arguments: Dict[str, Any]) -> str:
    """
    Execute the appropriate function based on the function name.
    
    :param function_name: The name of the function to execute
    :param arguments: A dictionary of arguments to pass to the function
    :return: The result of the function execution
    """
    # Validate tool inputs
    validate_tool_inputs(function_name, arguments)
    
    try:
        return tool_functions[function_name](**arguments)
    except Exception as e:
        return f"Error: {str(e)}"
