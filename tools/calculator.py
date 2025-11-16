"""Calculator tool - migrated from agent.py"""
from tools.base import BaseTool


class CalculatorTool(BaseTool):
    """Performs basic arithmetic operations"""
    
    name = "calculator"
    display_name = "Calculator"
    description = "Performs basic arithmetic operations: add, multiply, subtract, divide, power"
    icon = "IconCalculator"
    
    def get_parameters(self):
        """Define calculator parameters"""
        return {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "multiply", "subtract", "divide", "power"],
                    "description": "The arithmetic operation to perform"
                },
                "x": {
                    "type": "number",
                    "description": "First number"
                },
                "y": {
                    "type": "number",
                    "description": "Second number"
                }
            },
            "required": ["operation", "x", "y"]
        }
    
    def execute(self, operation: str, x: float, y: float) -> str:
        """
        Execute calculator operation.
        
        Args:
            operation: One of add, multiply, subtract, divide, power
            x: First number
            y: Second number
            
        Returns:
            str: Formatted result
        """
        try:
            if operation == "add":
                result = x + y
                return f'{x} + {y} = {result}'
            
            elif operation == "multiply":
                result = x * y
                return f'{x} * {y} = {result}'
            
            elif operation == "subtract":
                result = x - y
                return f'{x} - {y} = {result}'
            
            elif operation == "divide":
                if y == 0:
                    return "Error: Division by zero"
                result = x / y
                return f'{x} / {y} = {result}'
            
            elif operation == "power":
                result = x ** y
                return f'{x}^{y} = {result}'
            
            else:
                return f"Error: Unknown operation '{operation}'"
                
        except Exception as e:
            return f"Error: {str(e)}"

