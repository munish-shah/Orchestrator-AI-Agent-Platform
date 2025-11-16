"""Run history API routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from models.database import get_db
from models.run import Run

router = APIRouter()


@router.get("/runs")
async def list_runs(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None, regex="^(running|completed|failed)$"),
    db: Session = Depends(get_db)
):
    """
    Get list of runs for left sidebar in "Inspect Runs" page.
    
    Query params:
    - limit: Max runs to return (1-100, default 50)
    - offset: Pagination offset (default 0)
    - status: Filter by status (running, completed, failed)
    
    Returns:
        list: Run metadata for list display
    """
    query = db.query(Run)
    
    # Filter by status if provided
    if status:
        query = query.filter(Run.status == status)
    
    # Order by most recent first
    query = query.order_by(Run.created_at.desc())
    
    # Apply pagination
    runs = query.offset(offset).limit(limit).all()
    
    return [run.to_list_item() for run in runs]


@router.get("/runs/{run_id}")
async def get_run_details(run_id: str, db: Session = Depends(get_db)):
    """
    Get complete run with all steps for timeline visualization.
    
    Args:
        run_id: Run UUID
        db: Database session
        
    Returns:
        dict: Complete run with all steps
    """
    run = db.query(Run).filter(Run.id == run_id).first()
    
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    
    return run.to_dict()


@router.delete("/runs/{run_id}")
async def delete_run(run_id: str, db: Session = Depends(get_db)):
    """
    Delete a run and all its steps.
    
    Args:
        run_id: Run UUID
        db: Database session
        
    Returns:
        dict: Success message
    """
    run = db.query(Run).filter(Run.id == run_id).first()
    
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    
    db.delete(run)
    db.commit()
    
    return {"message": f"Run '{run_id}' deleted successfully"}


@router.get("/runs/stats/summary")
async def get_run_stats(db: Session = Depends(get_db)):
    """
    Get summary statistics for runs.
    
    Returns:
        dict: Run statistics
    """
    total_runs = db.query(Run).count()
    completed = db.query(Run).filter(Run.status == "completed").count()
    failed = db.query(Run).filter(Run.status == "failed").count()
    running = db.query(Run).filter(Run.status == "running").count()
    
    return {
        "total": total_runs,
        "completed": completed,
        "failed": failed,
        "running": running
    }

