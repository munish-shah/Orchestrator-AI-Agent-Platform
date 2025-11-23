"""Tool management API routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.database import get_db
from models.tool import Tool
from core.tool_registry import ToolRegistry

router = APIRouter()
# No global registry to allow dynamic discovery


class ToolUpdate(BaseModel):
    """Request model for updating tools"""
    enabled: Optional[bool] = None
    description: Optional[str] = None


@router.get("/tools")
async def list_tools(db: Session = Depends(get_db)):
    """
    Get all available tools for left sidebar.
    Combines code-based tools (from tools/) with DB settings.
    
    Returns:
        list: Tool metadata for list display
    """
    registry = ToolRegistry()
    tools_list = []
    
    for tool_id, tool_instance in registry.tools.items():
        # Check if tool has DB record (for enabled/disabled state)
        db_tool = db.query(Tool).filter(Tool.id == tool_id).first()
        
        tools_list.append({
            "id": tool_id,
            "name": tool_instance.display_name,
            "description": tool_instance.description,
            "icon": tool_instance.icon,
            "enabled": db_tool.enabled if db_tool else True
        })
    
    return tools_list


@router.get("/tools/{tool_id}")
async def get_tool_schema(tool_id: str, db: Session = Depends(get_db)):
    """
    Get full tool schema for right panel display.
    Shows JSON schema that will be sent to AI.
    
    Args:
        tool_id: Tool identifier
        db: Database session
        
    Returns:
        dict: Complete tool information including schema
    """
    registry = ToolRegistry()
    tool = registry.get_tool(tool_id)
    
    if not tool:
        raise HTTPException(
            status_code=404,
            detail=f"Tool '{tool_id}' not found. Available tools: {', '.join(registry.tools.keys())}"
        )
    
    # Get DB record if exists
    db_tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    return {
        "id": tool_id,
        "name": tool.display_name,
        "description": tool.description,
        "schema": tool.get_schema(),
        "icon": tool.icon,
        "enabled": db_tool.enabled if db_tool else True
    }


@router.put("/tools/{tool_id}")
async def update_tool(
    tool_id: str,
    update: ToolUpdate,
    db: Session = Depends(get_db)
):
    """
    Update tool settings (enable/disable, description override).
    Useful for temporarily disabling tools without deleting code.
    
    Args:
        tool_id: Tool identifier
        update: Update data
        db: Database session
        
    Returns:
        dict: Updated tool information
    """
    registry = ToolRegistry()
    
    # Verify tool exists in registry
    tool = registry.get_tool(tool_id)
    if not tool:
        raise HTTPException(
            status_code=404,
            detail=f"Tool '{tool_id}' not found"
        )
    
    # Get or create DB record
    db_tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not db_tool:
        # Create new DB record
        db_tool = Tool(
            id=tool_id,
            name=tool.name,
            display_name=tool.display_name,
            description=tool.description,
            schema=tool.get_schema(),
            icon=tool.icon
        )
        db.add(db_tool)
    
    # Update fields
    if update.enabled is not None:
        db_tool.enabled = update.enabled
    if update.description is not None:
        db_tool.description = update.description
    
    db.commit()
    db.refresh(db_tool)
    
    return db_tool.to_dict()


@router.get("/tools/stats/summary")
async def get_tool_stats(db: Session = Depends(get_db)):
    """
    Get tool usage statistics.
    
    Returns:
        dict: Tool statistics
    """
    registry = ToolRegistry()
    enabled_count = db.query(Tool).filter(Tool.enabled == True).count()
    disabled_count = db.query(Tool).filter(Tool.enabled == False).count()
    
    return {
        "total_available": len(registry),
        "enabled": enabled_count if enabled_count > 0 else len(registry),
        "disabled": disabled_count
    }
