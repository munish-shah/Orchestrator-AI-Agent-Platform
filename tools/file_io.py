"""File I/O tool for reading and writing files"""
from tools.base import BaseTool
import os
from pathlib import Path


class FileIOTool(BaseTool):
    """Reads and writes files from the disk"""
    
    name = "file_io"
    display_name = "File I/O"
    description = "Reads and writes files from the disk (with safety restrictions)"
    icon = "IconFile"
    
    # Safety: Only allow operations in a specific directory
    ALLOWED_DIR = Path("./agent_files")
    
    def __init__(self):
        super().__init__()
        # Create allowed directory if it doesn't exist
        self.ALLOWED_DIR.mkdir(exist_ok=True)
    
    def get_parameters(self):
        """Define file I/O parameters"""
        return {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["read", "write", "list"],
                    "description": "File operation to perform"
                },
                "filename": {
                    "type": "string",
                    "description": "Name of the file (for read/write operations)"
                },
                "content": {
                    "type": "string",
                    "description": "Content to write (for write operation only)"
                }
            },
            "required": ["operation"]
        }
    
    def _is_safe_path(self, filename: str) -> bool:
        """Check if file path is within allowed directory"""
        try:
            filepath = (self.ALLOWED_DIR / filename).resolve()
            return filepath.is_relative_to(self.ALLOWED_DIR.resolve())
        except Exception:
            return False
    
    def execute(self, operation: str, filename: str = None, content: str = None) -> str:
        """
        Execute file I/O operation.
        
        Args:
            operation: One of read, write, list
            filename: Name of file (for read/write)
            content: Content to write (for write only)
            
        Returns:
            str: Operation result
        """
        try:
            if operation == "list":
                # List files in allowed directory
                files = [f.name for f in self.ALLOWED_DIR.iterdir() if f.is_file()]
                if not files:
                    return "No files found in directory."
                return f"Files in directory:\n" + "\n".join(f"- {f}" for f in files)
            
            elif operation == "read":
                if not filename:
                    return "Error: filename required for read operation"
                
                if not self._is_safe_path(filename):
                    return "Error: Access denied - file outside allowed directory"
                
                filepath = self.ALLOWED_DIR / filename
                
                if not filepath.exists():
                    return f"Error: File '{filename}' not found"
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    file_content = f.read()
                
                return f"Contents of '{filename}':\n\n{file_content}"
            
            elif operation == "write":
                if not filename:
                    return "Error: filename required for write operation"
                
                if content is None:
                    return "Error: content required for write operation"
                
                if not self._is_safe_path(filename):
                    return "Error: Access denied - file outside allowed directory"
                
                filepath = self.ALLOWED_DIR / filename
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                return f"Successfully wrote {len(content)} characters to '{filename}'"
            
            else:
                return f"Error: Unknown operation '{operation}'"
                
        except Exception as e:
            return f"Error: {str(e)}"

