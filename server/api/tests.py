from django.test import TestCase
import unittest
from .services.tools.tools import validate_tool_inputs, execute_tool

class TestTools(unittest.TestCase):
    def test_validate_tool_inputs_missing_required_param(self):
        with self.assertRaises(ValueError) as context:
            validate_tool_inputs("ask_database", {})
        self.assertEqual(str(context.exception), "Missing required parameter: query")

    def test_validate_tool_inputs_invalid_param_type(self):
        with self.assertRaises(ValueError) as context:
            validate_tool_inputs("ask_database", {"query": 123})
        self.assertEqual(str(context.exception), "Parameter 'query' must be of type string")
    
    def test_validate_tool_inputs_invalid_function_name(self):
        with self.assertRaises(ValueError) as context:
            validate_tool_inputs("", {"query": "test"})
        self.assertEqual(str(context.exception), "Invalid tool function name")
    
    def test_validate_tool_inputs_non_dict_arguments(self):
        with self.assertRaises(ValueError) as context:
            validate_tool_inputs("ask_database", "not a dictionary")
        self.assertEqual(str(context.exception), "Tool arguments must be a dictionary")

    def test_execute_tool_invalid_function(self):
        with self.assertRaises(ValueError) as context:
            execute_tool("non_existent_function", {"query": "test"})
        self.assertIn("Tool function 'non_existent_function' does not exist", str(context.exception))