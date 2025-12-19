"""
RAG Knowledge Base implementation using LangChain and ChromaDB.
Handles document ingestion, embedding, and retrieval.
"""
import os
import shutil
from typing import List

# Constants
PERSIST_DIRECTORY = "./agent_knowledge_db"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

class KnowledgeBase:
    """
    Manages the local vector database for the agent's memory.
    """
    
    def __init__(self):
        """Initialize and check dependencies."""
        print("Initializing Knowledge Base...")
        self.vector_db = None
        self.embeddings = None
        
        # Lazy load to prevent import crashes during tool discovery
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            from langchain_community.vectorstores import Chroma
            
            # Initialize embedding model (runs locally)
            self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
            
            # Initialize Vector Store (ChromaDB)
            self.vector_db = Chroma(
                persist_directory=PERSIST_DIRECTORY,
                embedding_function=self.embeddings
            )
            print(f"Knowledge Base initialized at {PERSIST_DIRECTORY}")
        except Exception as e:
            print(f"Failed to initialize KnowledgeBase: {e}")

    def add_document(self, file_path: str) -> str:
        """
        Ingest a document into the knowledge base.
        Supports PDF, TXT, MD.
        """
        if not self.vector_db:
            return "Error: Knowledge Base not initialized (missing dependencies?)"

        if not os.path.exists(file_path):
            return f"Error: File '{file_path}' not found."
            
        try:
            # Lazy import loaders
            from langchain_community.document_loaders import PyPDFLoader, TextLoader, UnstructuredMarkdownLoader
            from langchain.text_splitter import RecursiveCharacterTextSplitter

            # 1. Load Document
            loader = self._get_loader(file_path)
            if not loader:
                return f"Error: Unsupported file type for '{file_path}'"
                
            documents = loader.load()
            
            # 2. Split Text
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            chunks = text_splitter.split_documents(documents)
            
            # 3. Add to Vector DB
            self.vector_db.add_documents(chunks)
            self.vector_db.persist()
            
            return f"Successfully added '{file_path}' to knowledge base. Created {len(chunks)} chunks."
            
        except Exception as e:
            return f"Error adding document: {str(e)}"

    def query(self, query_text: str, n_results: int = 3) -> str:
        """
        Search the knowledge base for relevant context.
        """
        if not self.vector_db:
             return "Error: Knowledge Base not initialized."

        try:
            results = self.vector_db.similarity_search(query_text, k=n_results)
            
            if not results:
                return "No relevant information found in knowledge base."
            
            # Format results
            context = "\n\n".join([f"[Source: {doc.metadata.get('source', 'Unknown')}]\n{doc.page_content}" for doc in results])
            return context
            
        except Exception as e:
            return f"Error querying knowledge base: {str(e)}"
            
    def clear(self):
        """Clear the entire knowledge base."""
        if os.path.exists(PERSIST_DIRECTORY):
            shutil.rmtree(PERSIST_DIRECTORY)
            return "Knowledge base cleared."
        return "Knowledge base was already empty."

    def _get_loader(self, file_path: str):
        """Return appropriate loader based on file extension."""
        from langchain_community.document_loaders import PyPDFLoader, TextLoader, UnstructuredMarkdownLoader
        
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return PyPDFLoader(file_path)
        elif ext == ".txt":
            return TextLoader(file_path)
        elif ext == ".md":
            return UnstructuredMarkdownLoader(file_path)
        return None
