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


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str
    run_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Main chat endpoint for Model Playground.
    
    Flow:
    1. Create new Run
    2. Initialize Agent Engine with RunTracker
    3. Execute agent (tracks all steps)
    4. Save Run to database
    5. Return response and run_id
    
    Args:
        request: ChatRequest with user message
        db: Database session
        
    Returns:
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
    engine = AgentEngine(tracker=tracker, tool_registry=tool_registry)
    
    try:
        # Execute agent
        response = await engine.run(request.message)
        
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

