"""Playground API routes - chat endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db
from models.run import Run
from core.agent_engine import AgentEngine
from core.run_tracker import RunTracker
from core.tool_registry import ToolRegistry

router = APIRouter()


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str
    model: str = None  # Optional model override
    tools: list[str] = None  # Optional list of allowed tools


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str
    run_id: str


from core.model_config import get_model_id, MODEL_MAPPINGS, DEFAULT_MODEL

@router.get("/models")
async def list_models():
    """List available models"""
    return {
        "models": list(MODEL_MAPPINGS.keys()),
        "default": DEFAULT_MODEL
    }

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
        ChatResponse with agent response and run ID
    """
    # Create run
    run = Run(user_query=request.message, status="running")
    db.add(run)
    db.commit()
    db.refresh(run)
    
    # Initialize components
    tracker = RunTracker(run)
    tool_registry = ToolRegistry()
    
    # Resolve model ID
    model_id = get_model_id(request.model) if request.model else None
    
    engine = AgentEngine(tracker=tracker, tool_registry=tool_registry, model_id=model_id)
    
    try:
        # Execute agent
        response = await engine.run(request.message, allowed_tools=request.tools)
        
        # Finalize run
        tracker.finalize("completed")
        db.commit()
        
        return ChatResponse(response=response, run_id=run.id)
    
    except Exception as e:
        # Mark as failed and save
        tracker.finalize("failed")
        db.commit()
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")


@router.get("/chat/status")
async def chat_status():
    """Health check for chat endpoint"""
    return {
        "status": "operational",
        "endpoint": "/api/chat"
    }

