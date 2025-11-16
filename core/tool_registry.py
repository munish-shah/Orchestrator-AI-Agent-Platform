"""Dynamic tool discovery and execution"""
import importlib
import inspect
from pathlib import Path
from typing import Dict, List, Any
from tools.base import BaseTool


class ToolRegistry:
    """
    Discovers and manages all available tools.
    Auto-loads tools from tools/ directory.
    """
    
    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
        self._discover_tools()
    
    def _discover_tools(self):
        """
        Auto-discover all tools from tools/ directory.
        Looks for classes that inherit from BaseTool.
        """
        tools_dir = Path(__file__).parent.parent / "tools"
        
        for file_path in tools_dir.glob("*.py"):
            # Skip __init__.py and base.py
            if file_path.name in ["__init__.py", "base.py"]:
                continue
            
            try:
                # Import module
                module_name = f"tools.{file_path.stem}"
                module = importlib.import_module(module_name)
                
                # Find all classes in module
                for name, obj in inspect.getmembers(module, inspect.isclass):
                    # Check if it's a BaseTool subclass (but not BaseTool itself)
                    if issubclass(obj, BaseTool) and obj != BaseTool:
                        # Instantiate and register tool
                        tool_instance = obj()
                        self.tools[tool_instance.name] = tool_instance
                        
            except Exception as e:
                print(f"Warning: Failed to load tool from {file_path.name}: {e}")
    
    def get_schemas(self) -> List[Dict[str, Any]]:
        """
        Get all tool schemas for OpenAI function calling.
        
        Returns:
            list: List of OpenAI-compatible tool schemas
        """
        return [tool.get_schema() for tool in self.tools.values()]
    
    def execute(self, tool_name: str, **params) -> Any:
        """
        Execute a tool by name.
        
        Args:
            tool_name: Name of the tool to execute
            **params: Tool-specific parameters
            
        Returns:
            Tool execution result
            
        Raises:
            ValueError: If tool not found
        """
        if tool_name not in self.tools:
            available_tools = ", ".join(self.tools.keys())
            raise ValueError(
                f"Tool '{tool_name}' not found. "
                f"Available tools: {available_tools}"
            )
        
        return self.tools[tool_name].execute(**params)
    
    def get_tool(self, tool_name: str) -> BaseTool:
        """
        Get tool instance by name.
        
        Args:
            tool_name: Name of the tool
            
        Returns:
            BaseTool: Tool instance
        """
        return self.tools.get(tool_name)
    
    def list_tools(self) -> List[Dict[str, Any]]:
        """
        List all tools for frontend.
        
        Returns:
            list: List of tool metadata dicts
        """
        return [
            {
                "id": tool.name,
                "name": tool.display_name,
                "description": tool.description,
                "icon": tool.icon
            }
            for tool in self.tools.values()
        ]
    
    def __len__(self):
        """Number of registered tools"""
        return len(self.tools)
    
    def __contains__(self, tool_name: str):
        """Check if tool is registered"""
        return tool_name in self.tools
    
    def __repr__(self):
        return f"<ToolRegistry: {len(self.tools)} tools>"

