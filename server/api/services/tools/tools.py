from django.db import connection
from typing import Dict, Any, Callable
from .database import ask_database, get_database_info

database_schema_dict = get_database_info(connection)
database_schema_string = "\n".join(
    [
        f"Table: {table['table_name']}\nColumns: {', '.join(table['column_names'])}"
        for table in database_schema_dict
    ]
)

# Dictionary to map function names to their corresponding functions
tool_functions: Dict[str, Callable] = {
    'ask_database': ask_database,
}

def execute_tool(function_name: str, arguments: Dict[str, Any]) -> str:
    """
    Execute the appropriate function based on the function name.
    
    :param function_name: The name of the function to execute
    :param arguments: A dictionary of arguments to pass to the function
    :return: The result of the function execution
    """
    if function_name in tool_functions:
        return tool_functions[function_name](**arguments)
    else:
        return f"Error: function {function_name} does not exist"

tools = [
    {
        "type": "function",
        "function": {
            "name": "ask_database",
            "description": "Use this function to answer user questions about medication in the Balancer database. Input should be a fully formed SQL query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": f"""
                                SQL query extracting info to answer the user's question.
                                SQL should be written using this database schema:
                                {database_schema_string}
                                The query should be returned in plain text, not in JSON.
                                """,
                    }
                },
                "required": ["query"],
            },
        }
    }
]