"""Base class for all agent tools"""
from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseTool(ABC):
    """
    Abstract base class that all tools must inherit from.
    Ensures consistency across all tools.
    """
    
    # Tool metadata (override in subclasses)
    name: str = "tool_name"
    display_name: str = "Tool Name"
    description: str = "What this tool does"
    icon: str = "IconTool"  # Icon name for frontend
    
    @abstractmethod
    def execute(self, **kwargs) -> Any:
        """
        Execute the tool with given parameters.
        Must be implemented by each tool.
        
        Args:
            **kwargs: Tool-specific parameters
            
        Returns:
            Tool execution result (any type)
        """
        raise NotImplementedError("Tool must implement execute() method")
    
    @abstractmethod
    def get_parameters(self) -> Dict[str, Any]:
        """
        Define tool parameters in JSON Schema format.
        Used for OpenAI function calling.
        
        Returns:
            dict: JSON Schema for parameters
        """
        raise NotImplementedError("Tool must implement get_parameters() method")
    
    def get_schema(self) -> Dict[str, Any]:
        """
        Returns OpenAI function calling schema.
        Override if custom schema format needed.
        
        Returns:
            dict: Complete OpenAI-compatible tool schema
        """
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.get_parameters()
            }
        }
    
    def __str__(self):
        return f"{self.display_name} ({self.name})"
    
    def __repr__(self):
        return f"<{self.__class__.__name__}: {self.name}>"

