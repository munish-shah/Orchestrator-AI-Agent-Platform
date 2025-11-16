"""Run and RunStep models for execution tracking"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from models.database import Base
import uuid
from datetime import datetime


class Run(Base):
    """
    Represents a single agent execution.
    Powers the "Inspect Runs" page in frontend.
    """
    __tablename__ = "runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_query = Column(String, nullable=False)
    status = Column(String, default="running")  # running, completed, failed
    created_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    steps = relationship("RunStep", back_populates="run", order_by="RunStep.order", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert to dict for API responses"""
        return {
            "id": self.id,
            "user_query": self.user_query,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "steps": [step.to_dict() for step in self.steps]
        }
    
    def to_list_item(self):
        """Convert to list item for runs list API"""
        return {
            "id": self.id,
            "name": f"Run {self.id[:8]}",
            "time": self.created_at.strftime("%I:%M %p") if self.created_at else "",
            "status": self.status.capitalize(),
            "user_query": self.user_query
        }


class RunStep(Base):
    """
    Individual step in a run execution.
    Types: user-request, agent-thought, tool-call, tool-result, agent-response
    """
    __tablename__ = "run_steps"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String, ForeignKey("runs.id"), nullable=False)
    type = Column(String, nullable=False)  # user-request, agent-thought, tool-call, tool-result, agent-response
    content = Column(JSON, nullable=False)  # Flexible JSON for any step data
    timestamp = Column(DateTime, default=datetime.now)
    order = Column(Integer, nullable=False)  # Maintain step sequence
    
    # Relationships
    run = relationship("Run", back_populates="steps")
    
    def to_dict(self):
        """Convert to dict for API responses"""
        return {
            "id": self.id,
            "type": self.type,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "order": self.order
        }

