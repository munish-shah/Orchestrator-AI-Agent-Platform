"""
Tools for interacting with the Agent's Personal Knowledge Base (RAG).
"""
from tools.base import BaseTool
from core.knowledge_base import KnowledgeBase

# Singleton instance to share DB connection across tool calls
_kb_instance = None

def get_kb():
    global _kb_instance
    if _kb_instance is None:
        _kb_instance = KnowledgeBase()
    return _kb_instance

class RememberTool(BaseTool):
    """Tool to ingest documents into the knowledge base."""
    
    name = "remember_file"
    display_name = "Remember File"
    description = "Reads a file (PDF, TXT, MD) and stores its content in your long-term memory."
    icon = "IconDatabase"
    
    def get_parameters(self):
        return {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Absolute path to the file to remember"
                }
            },
            "required": ["file_path"]
        }
    
    def execute(self, file_path: str) -> str:
        kb = get_kb()
        return kb.add_document(file_path)


class RecallTool(BaseTool):
    """Tool to search the knowledge base."""
    
    name = "recall_memory"
    display_name = "Recall Memory"
    description = "Searches your long-term memory (knowledge base) for information."
    icon = "IconSearch"
    
    def get_parameters(self):
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The question or topic to search for"
                }
            },
            "required": ["query"]
        }
    
    def execute(self, query: str) -> str:
        kb = get_kb()
        return kb.query(query)
