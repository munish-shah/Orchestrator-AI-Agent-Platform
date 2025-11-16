"""Run tracking for execution history"""
from typing import Dict, Any
from datetime import datetime
from models.run import Run, RunStep


class RunTracker:
    """
    Tracks steps during agent execution.
    Creates RunStep objects and associates them with a Run.
    """
    
    def __init__(self, run: Run):
        """
        Initialize tracker for a specific run.
        
        Args:
            run: Run object to track steps for
        """
        self.run = run
        self.step_order = 0
    
    def add_step(self, step_data: Dict[str, Any]):
        """
        Add a new step to the current run.
        
        Args:
            step_data: Dict containing step information
                - type: Step type (user-request, agent-thought, tool-call, etc.)
                - content: Step content (varies by type)
                - toolName: Tool name (for tool-call and tool-result types)
                - params: Tool parameters (for tool-call type)
                - result: Tool result (for tool-result type)
        """
        # Ensure step_data has 'type' field
        if 'type' not in step_data:
            raise ValueError("step_data must include 'type' field")
        
        # Create RunStep
        step = RunStep(
            run_id=self.run.id,
            type=step_data['type'],
            content=step_data,  # Store entire dict as JSON
            timestamp=datetime.now(),
            order=self.step_order
        )
        
        self.step_order += 1
        self.run.steps.append(step)
    
    def finalize(self, status: str):
        """
        Mark run as complete.
        
        Args:
            status: Final status (completed or failed)
        """
        self.run.status = status
        self.run.completed_at = datetime.now()
    
    def get_step_count(self) -> int:
        """Get number of steps tracked so far"""
        return len(self.run.steps)
    
    def __repr__(self):
        return f"<RunTracker: run_id={self.run.id}, steps={self.step_order}>"

