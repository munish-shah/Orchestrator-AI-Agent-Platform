# AI Agent Platform - Backend Architecture

## Overview

This document describes the complete backend architecture for the AI Agent Platform, designed to power the React frontend (`AgentPlatform.jsx`). The backend transforms the simple `agent.py` into a production-ready system with run tracking, tool management, and API endpoints.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  - Model Playground                                          │
│  - Inspect Runs                                              │
│  - Manage Tools                                              │
│  - Build Agents                                              │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/WebSocket
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Server (api/main.py)                    │
│  - REST Endpoints                                            │
│  - WebSocket Streaming                                       │
│  - CORS for React                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│          Agent Engine (core/agent_engine.py)                 │
│  - Enhanced agent.py logic                                   │
│  - Step-by-step tracking                                     │
│  - Event emission                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
┌───────────────┐   ┌──────────────────┐
│ Tool Registry │   │   Run Tracker    │
│               │   │                  │
│ - Discovers   │   │ - Captures steps │
│ - Executes    │   │ - Saves to DB    │
│ - Schemas     │   │ - History        │
└───────┬───────┘   └────────┬─────────┘
        │                    │
        ↓                    ↓
┌───────────────┐   ┌──────────────────┐
│  Tools (*.py) │   │  Database (SQLite)│
│               │   │                  │
│ - calculator  │   │ - runs           │
│ - web_search  │   │ - run_steps      │
│ - file_io     │   │ - tools          │
└───────────────┘   └──────────────────┘
```

---

## Directory Structure

```
AI-Agent/
├── agent.py                    # Original simple agent (kept as reference)
│
├── api/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── playground.py       # Chat endpoints (POST /chat, WS /ws/chat)
│   │   ├── runs.py             # Run history (GET /runs, GET /runs/{id})
│   │   ├── tools.py            # Tool CRUD (GET/POST/PUT/DELETE /tools)
│   │   └── workflows.py        # Future: workflow management
│   └── deps.py                 # Dependency injection (DB sessions, etc.)
│
├── core/
│   ├── __init__.py
│   ├── agent_engine.py         # Enhanced agent with run tracking
│   ├── tool_registry.py        # Dynamic tool loading/execution
│   └── run_tracker.py          # Tracks steps for "Inspect Runs" feature
│
├── models/
│   ├── __init__.py
│   ├── database.py             # SQLAlchemy setup + session management
│   ├── run.py                  # Run and RunStep models
│   ├── tool.py                 # Tool model
│   └── workflow.py             # Future: Workflow model
│
├── tools/
│   ├── __init__.py
│   ├── base.py                 # BaseTool abstract class
│   ├── calculator.py           # Calculator tool (from agent.py)
│   ├── web_search.py           # Web search tool
│   └── file_io.py              # File I/O tool
│
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (API keys)
├── .gitignore
└── Architecture.md             # This file
```

---

## Core Components

### 1. Agent Engine (`core/agent_engine.py`)

**Purpose:** Enhanced version of `agent.py` that tracks every action for the frontend's "Inspect Runs" feature.

**Key Enhancements:**
- Wraps the existing agent loop with event emission
- Tracks: user requests, agent thoughts, tool calls, tool results, responses
- Integrates with `RunTracker` to save execution history
- Supports streaming mode for real-time updates

**Comparison:**

| Current `agent.py` | Enhanced `agent_engine.py` |
|-------------------|---------------------------|
| Prints to console | Emits structured events |
| No history | Saves to database |
| Single execution | Supports multiple concurrent runs |
| No streaming | WebSocket streaming support |

**Core Logic:**
```python
class AgentEngine:
    def __init__(self, tracker: RunTracker, tool_registry: ToolRegistry):
        self.tracker = tracker
        self.tools = tool_registry
        self.client = OpenAI(...)  # From agent.py
    
    async def run(self, user_goal: str) -> str:
        """Enhanced version of run_agent() from agent.py"""
        
        # Track user request
        self.tracker.add_step({
            'type': 'user-request',
            'content': user_goal
        })
        
        messages = [{"role": "user", "content": user_goal}]
        tool_schemas = self.tools.get_schemas()
        
        iteration = 0
        while iteration < 10:
            iteration += 1
            
            # Call LLM (same as agent.py)
            response = self.client.chat.completions.create(
                model=os.getenv('MODEL'),
                messages=messages,
                tools=tool_schemas,
                stream=False
            )
            
            assistant_message = response.choices[0].message
            messages.append(assistant_message)
            
            # Track agent thinking
            if assistant_message.tool_calls:
                self.tracker.add_step({
                    'type': 'agent-thought',
                    'content': f'Using tool: {assistant_message.tool_calls[0].function.name}'
                })
                
                # Execute tool
                for tool_call in assistant_message.tool_calls:
                    # Track tool call
                    self.tracker.add_step({
                        'type': 'tool-call',
                        'toolName': tool_call.function.name,
                        'params': json.loads(tool_call.function.arguments)
                    })
                    
                    # Execute (via registry)
                    result = self.tools.execute(
                        tool_call.function.name,
                        **json.loads(tool_call.function.arguments)
                    )
                    
                    # Track result
                    self.tracker.add_step({
                        'type': 'tool-result',
                        'toolName': tool_call.function.name,
                        'result': str(result)
                    })
                    
                    # Add to conversation
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": str(result)
                    })
            else:
                # Agent is done
                self.tracker.add_step({
                    'type': 'agent-response',
                    'content': assistant_message.content
                })
                return assistant_message.content
        
        return "Max iterations reached"
```

---

### 2. Run Tracker (`core/run_tracker.py`)

**Purpose:** Captures and persists every step of an agent execution for historical analysis.

**Responsibilities:**
- Creates a new `Run` object at start
- Appends `RunStep` objects as execution progresses
- Saves complete run to database when finished
- Provides run data for "Inspect Runs" frontend page

**Data Models:**

```python
Run:
    id: str (UUID)
    user_query: str
    status: "running" | "completed" | "failed"
    created_at: datetime
    completed_at: datetime
    steps: List[RunStep]

RunStep:
    id: str (UUID)
    run_id: str (foreign key)
    type: str  # "user-request", "agent-thought", "tool-call", "tool-result", "agent-response"
    content: dict (JSON)
    timestamp: datetime
    order: int  # For maintaining sequence
```

**Usage:**
```python
class RunTracker:
    def __init__(self, run: Run):
        self.run = run
        self.step_order = 0
    
    def add_step(self, step_data: dict):
        """Add a new step to the current run"""
        step = RunStep(
            run_id=self.run.id,
            type=step_data['type'],
            content=step_data,
            timestamp=datetime.now(),
            order=self.step_order
        )
        self.step_order += 1
        self.run.steps.append(step)
    
    def finalize(self, status: str):
        """Mark run as complete and save to DB"""
        self.run.status = status
        self.run.completed_at = datetime.now()
```

**Frontend Integration:**
The frontend's `InspectRunsPage` expects step types:
- `user-request` → Blue chat bubble (right aligned)
- `agent-thought` → Collapsible card with brain icon
- `tool-call` → Blue-bordered card showing parameters
- `tool-result` → Green-bordered card showing output
- `agent-response` → Gray chat bubble (left aligned) with logo

---

### 3. Tool Registry (`core/tool_registry.py`)

**Purpose:** Dynamic tool discovery, schema generation, and execution routing.

**Key Features:**
- Auto-discovers tools from `tools/` directory
- Provides OpenAI-compatible schemas to agent
- Routes tool execution requests to correct implementation
- Supports enable/disable functionality for frontend

**Architecture:**
```python
class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
        self._discover_tools()
    
    def _discover_tools(self):
        """Auto-load all tools from tools/ directory"""
        tools_dir = Path(__file__).parent.parent / "tools"
        for file in tools_dir.glob("*.py"):
            if file.name not in ["__init__.py", "base.py"]:
                module = importlib.import_module(f"tools.{file.stem}")
                for item in dir(module):
                    obj = getattr(module, item)
                    if isinstance(obj, type) and issubclass(obj, BaseTool) and obj != BaseTool:
                        tool = obj()
                        self.tools[tool.name] = tool
    
    def get_schemas(self) -> List[dict]:
        """Return all tool schemas for OpenAI function calling"""
        return [tool.get_schema() for tool in self.tools.values()]
    
    def execute(self, tool_name: str, **params) -> Any:
        """Execute a tool by name"""
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found")
        return self.tools[tool_name].execute(**params)
    
    def get_tool(self, tool_name: str) -> BaseTool:
        """Get tool instance for inspection"""
        return self.tools.get(tool_name)
    
    def list_tools(self) -> List[dict]:
        """List all tools for frontend"""
        return [
            {
                "id": name,
                "name": tool.display_name,
                "description": tool.description,
                "icon": tool.icon
            }
            for name, tool in self.tools.items()
        ]
```

**Benefits:**
- **Extensibility**: Drop in new tool file → automatically available
- **Consistency**: All tools follow same interface
- **Frontend integration**: Powers "Manage Tools" page

---

### 4. Base Tool Class (`tools/base.py`)

**Purpose:** Standard interface that all tools must implement.

**Design:**
```python
from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseTool(ABC):
    """Base class for all agent tools"""
    
    # Tool metadata
    name: str = "tool_name"
    display_name: str = "Tool Name"
    description: str = "What this tool does"
    icon: str = "IconName"  # For frontend
    
    @abstractmethod
    def execute(self, **kwargs) -> Any:
        """
        Execute the tool with given parameters.
        Must be implemented by each tool.
        """
        raise NotImplementedError
    
    def get_schema(self) -> dict:
        """
        Returns OpenAI function calling schema.
        Override if custom schema needed.
        """
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.get_parameters()
            }
        }
    
    @abstractmethod
    def get_parameters(self) -> dict:
        """
        Define tool parameters in JSON Schema format.
        """
        raise NotImplementedError
```

**Example Implementation (Calculator):**
```python
from tools.base import BaseTool

class CalculatorTool(BaseTool):
    name = "calculator"
    display_name = "Calculator"
    description = "Performs basic arithmetic operations"
    icon = "IconCalculator"
    
    def get_parameters(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "multiply", "subtract", "divide", "power"],
                    "description": "The arithmetic operation to perform"
                },
                "x": {
                    "type": "number",
                    "description": "First number"
                },
                "y": {
                    "type": "number",
                    "description": "Second number"
                }
            },
            "required": ["operation", "x", "y"]
        }
    
    def execute(self, operation: str, x: float, y: float) -> str:
        """Execute calculator operation"""
        if operation == "add":
            return f'{x} + {y} = {x + y}'
        elif operation == "multiply":
            return f'{x} * {y} = {x * y}'
        elif operation == "subtract":
            return f'{x} - {y} = {x - y}'
        elif operation == "divide":
            if y == 0:
                return "Error: Division by zero"
            return f'{x} / {y} = {x / y}'
        elif operation == "power":
            return f'{x}^{y} = {x ** y}'
        else:
            return f"Unknown operation: {operation}"
```

---

### 5. Database Models (`models/`)

**Purpose:** Persistent storage for runs, tools, and workflows.

#### `models/database.py` - Setup
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./agent_platform.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### `models/run.py` - Run and RunStep
```python
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from models.database import Base
import uuid
from datetime import datetime

class Run(Base):
    __tablename__ = "runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_query = Column(String, nullable=False)
    status = Column(String, default="running")  # running, completed, failed
    created_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    steps = relationship("RunStep", back_populates="run", order_by="RunStep.order")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_query": self.user_query,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "steps": [step.to_dict() for step in self.steps]
        }

class RunStep(Base):
    __tablename__ = "run_steps"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String, ForeignKey("runs.id"), nullable=False)
    type = Column(String, nullable=False)  # user-request, agent-thought, tool-call, etc.
    content = Column(JSON, nullable=False)  # Flexible JSON for any step data
    timestamp = Column(DateTime, default=datetime.now)
    order = Column(Integer, nullable=False)  # Maintain step sequence
    
    # Relationships
    run = relationship("Run", back_populates="steps")
    
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "order": self.order
        }
```

#### `models/tool.py` - Tool Registry Storage
```python
from sqlalchemy import Column, String, Boolean, JSON
from models.database import Base

class Tool(Base):
    __tablename__ = "tools"
    
    id = Column(String, primary_key=True)  # Same as tool.name
    name = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    schema = Column(JSON, nullable=False)  # Full OpenAI schema
    enabled = Column(Boolean, default=True)
    icon = Column(String, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
            "schema": self.schema,
            "enabled": self.enabled,
            "icon": self.icon
        }
```

---

### 6. FastAPI Application (`api/main.py`)

**Purpose:** HTTP server that exposes REST and WebSocket endpoints.

**Setup:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import playground, runs, tools
from models.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Agent Platform API",
    description="Backend for Orchestrator AI Agent Platform",
    version="1.0.0"
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite/CRA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(playground.router, prefix="/api", tags=["Playground"])
app.include_router(runs.router, prefix="/api", tags=["Runs"])
app.include_router(tools.router, prefix="/api", tags=["Tools"])

@app.get("/")
async def root():
    return {"message": "AI Agent Platform API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

### 7. API Routes

#### `api/routes/playground.py` - Chat Endpoints

**Powers:** Frontend "Model Playground" page

```python
from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy.orm import Session
from models.database import get_db
from models.run import Run
from core.agent_engine import AgentEngine
from core.run_tracker import RunTracker
from core.tool_registry import ToolRegistry
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    model: str = None  # Optional model override

class ChatResponse(BaseModel):
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
        tracker.finalize("failed")
        db.commit()
        raise

@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for streaming chat responses.
    
    Sends each step as it happens:
    - {"type": "user-request", "content": "..."}
    - {"type": "agent-thought", "content": "..."}
    - {"type": "tool-call", "toolName": "...", "params": {...}}
    - {"type": "tool-result", "result": "..."}
    - {"type": "agent-response", "content": "..."}
    """
    await websocket.accept()
    
    try:
        # Receive message
        data = await websocket.receive_json()
        message = data.get("message")
        
        # Create run (save to DB for history)
        # ... (similar to /chat)
        
        # Stream steps
        async for step in engine.run_stream(message):
            await websocket.send_json(step)
        
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
    finally:
        await websocket.close()
```

#### `api/routes/runs.py` - Run History

**Powers:** Frontend "Inspect Runs" page

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.run import Run
from typing import List

router = APIRouter()

@router.get("/runs")
async def list_runs(
    limit: int = 50,
    offset: int = 0,
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    Get list of runs for left sidebar in "Inspect Runs" page.
    
    Query params:
    - limit: Max runs to return
    - offset: Pagination offset
    - status: Filter by status (completed, failed, running)
    """
    query = db.query(Run)
    
    if status:
        query = query.filter(Run.status == status)
    
    runs = query.order_by(Run.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": run.id,
            "name": f"Run {run.id[:8]}",  # Short ID for display
            "time": run.created_at.strftime("%I:%M %p"),
            "status": run.status.capitalize(),
            "user_query": run.user_query
        }
        for run in runs
    ]

@router.get("/runs/{run_id}")
async def get_run_details(run_id: str, db: Session = Depends(get_db)):
    """
    Get complete run with all steps for timeline visualization.
    
    Returns:
    - Run metadata
    - All steps in order (user-request, agent-thought, tool-call, etc.)
    """
    run = db.query(Run).filter(Run.id == run_id).first()
    
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return run.to_dict()

@router.delete("/runs/{run_id}")
async def delete_run(run_id: str, db: Session = Depends(get_db)):
    """Delete a run and all its steps"""
    run = db.query(Run).filter(Run.id == run_id).first()
    
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    db.delete(run)
    db.commit()
    
    return {"message": "Run deleted successfully"}
```

#### `api/routes/tools.py` - Tool Management

**Powers:** Frontend "Manage Tools" page

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.tool import Tool
from core.tool_registry import ToolRegistry
from pydantic import BaseModel

router = APIRouter()
registry = ToolRegistry()

class ToolUpdate(BaseModel):
    enabled: bool = None
    description: str = None

@router.get("/tools")
async def list_tools(db: Session = Depends(get_db)):
    """
    Get all available tools for left sidebar.
    Combines code-based tools (from tools/) with DB settings.
    """
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
    """
    tool = registry.get_tool(tool_id)
    
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    return {
        "id": tool_id,
        "name": tool.display_name,
        "description": tool.description,
        "schema": tool.get_schema(),
        "icon": tool.icon
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
    """
    # Get or create DB record
    db_tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not db_tool:
        tool = registry.get_tool(tool_id)
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        
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
```

---

## Complete Request Flow Example

### Scenario: User asks "What is 5 + 10, then multiply by 3?"

#### 1. Frontend Action
```javascript
// User types in Playground chat input
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is 5 + 10, then multiply by 3?"
  })
});
```

#### 2. API Route (`playground.py`)
```python
@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Create new Run
    run = Run(
        user_query="What is 5 + 10, then multiply by 3?",
        status="running"
    )
    db.add(run)
    db.commit()
    
    # Initialize tracking
    tracker = RunTracker(run)
    tool_registry = ToolRegistry()
    engine = AgentEngine(tracker=tracker, tool_registry=tool_registry)
    
    # Execute agent
    response = await engine.run(request.message)
    
    # Save complete run
    tracker.finalize("completed")
    db.commit()
    
    return {"response": response, "run_id": run.id}
```

#### 3. Agent Engine Execution

**Iteration 1:**
```python
# User request tracked
tracker.add_step({
    'type': 'user-request',
    'content': 'What is 5 + 10, then multiply by 3?'
})

# Call LLM
response = client.chat.completions.create(
    model='protected.Claude Sonnet 4.5',
    messages=[{"role": "user", "content": "What is 5 + 10, then multiply by 3?"}],
    tools=tool_registry.get_schemas()
)

# AI decides to use calculator for addition
tracker.add_step({
    'type': 'agent-thought',
    'content': 'User wants two calculations. First, I need to add 5 and 10.'
})

tracker.add_step({
    'type': 'tool-call',
    'toolName': 'calculator',
    'params': {'operation': 'add', 'x': 5, 'y': 10}
})

# Execute tool
result = tool_registry.execute('calculator', operation='add', x=5, y=10)
# result = "5 + 10 = 15"

tracker.add_step({
    'type': 'tool-result',
    'toolName': 'calculator',
    'result': '5 + 10 = 15'
})

# Add result to conversation
messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,
    "content": "5 + 10 = 15"
})
```

**Iteration 2:**
```python
# Call LLM again with tool result
response = client.chat.completions.create(
    model='protected.Claude Sonnet 4.5',
    messages=messages,  # Now includes tool result
    tools=tool_registry.get_schemas()
)

# AI decides to multiply
tracker.add_step({
    'type': 'agent-thought',
    'content': 'Got 15. Now I need to multiply this by 3.'
})

tracker.add_step({
    'type': 'tool-call',
    'toolName': 'calculator',
    'params': {'operation': 'multiply', 'x': 15, 'y': 3}
})

result = tool_registry.execute('calculator', operation='multiply', x=15, y=3)
# result = "15 * 3 = 45"

tracker.add_step({
    'type': 'tool-result',
    'toolName': 'calculator',
    'result': '15 * 3 = 45'
})

messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,
    "content": "15 * 3 = 45"
})
```

**Iteration 3:**
```python
# Call LLM one more time
response = client.chat.completions.create(
    model='protected.Claude Sonnet 4.5',
    messages=messages,
    tools=tool_registry.get_schemas()
)

# AI doesn't need more tools - responds with text
assistant_message.content = "The result is 45."
assistant_message.tool_calls = None

tracker.add_step({
    'type': 'agent-response',
    'content': 'The result is 45.'
})

# Exit loop - done!
return "The result is 45."
```

#### 4. Database State

**After execution, database contains:**

`runs` table:
```
id: "run-abc123"
user_query: "What is 5 + 10, then multiply by 3?"
status: "completed"
created_at: "2024-11-16 11:58:00"
completed_at: "2024-11-16 11:58:03"
```

`run_steps` table (8 rows):
```
1. type: "user-request", content: {...}, order: 0
2. type: "agent-thought", content: {...}, order: 1
3. type: "tool-call", content: {...}, order: 2
4. type: "tool-result", content: {...}, order: 3
5. type: "agent-thought", content: {...}, order: 4
6. type: "tool-call", content: {...}, order: 5
7. type: "tool-result", content: {...}, order: 6
8. type: "agent-response", content: {...}, order: 7
```

#### 5. Frontend Receives Response
```javascript
{
  "response": "The result is 45.",
  "run_id": "run-abc123"
}
```

#### 6. User Views "Inspect Runs"

Frontend calls:
```javascript
const run = await fetch(`http://localhost:8000/api/runs/run-abc123`);
```

Backend returns full timeline, which frontend renders as:
- Blue chat bubble: "What is 5 + 10, then multiply by 3?"
- Collapsible thought card: "User wants two calculations..."
- Blue tool call card: calculator(add, 5, 10)
- Green result card: "5 + 10 = 15"
- Collapsible thought card: "Got 15. Now multiply..."
- Blue tool call card: calculator(multiply, 15, 3)
- Green result card: "15 * 3 = 45"
- Gray chat bubble: "The result is 45."

---

## Key Design Decisions

### Why FastAPI?
- **Built-in WebSocket support** - Required for streaming responses
- **Automatic API documentation** - `/docs` endpoint with Swagger UI
- **Type hints & validation** - Pydantic models for request/response
- **Async support** - Handle multiple concurrent agent runs
- **Modern Python** - Pythonic, clean, fast

### Why SQLite?
- **Zero configuration** - No database server setup
- **File-based** - Easy backups, version control
- **Perfect for development** - Fast, lightweight
- **Easy migration path** - SQLAlchemy makes Postgres upgrade trivial
- **Persistent storage** - Unlike in-memory, survives restarts

### Why Tool Registry Pattern?
- **Pluggability** - Add new tool by creating single file
- **Auto-discovery** - No manual registration needed
- **Consistency** - All tools follow same interface
- **Frontend integration** - Tools automatically appear in "Manage Tools"
- **Testability** - Easy to mock tools for testing

### Why Run Tracking?
- **Debugging** - See exactly what agent did, step-by-step
- **Analytics** - Measure token usage, latency, tool frequency
- **Replay capability** - Re-run past executions
- **User transparency** - Users understand agent reasoning
- **Frontend feature** - Powers entire "Inspect Runs" page

### Why Separate Agent Engine from API?
- **Reusability** - Engine can be used standalone (CLI, notebooks)
- **Testing** - Test agent logic without HTTP layer
- **Flexibility** - Swap out API framework without changing core logic
- **Single Responsibility** - Engine = agent logic, API = HTTP interface

---

## Technology Stack

### Backend
- **Python 3.10+** - Modern async features
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM for database
- **SQLite** - Database (dev), Postgres (prod)
- **Pydantic** - Data validation
- **OpenAI Python SDK** - LLM integration
- **python-dotenv** - Environment variable management

### Development
- **uvicorn** - ASGI server for FastAPI
- **alembic** - Database migrations (future)
- **pytest** - Testing framework (future)

---

## Environment Variables

Required in `.env`:
```bash
# LLM API Configuration
API_KEY=your-tamu-api-key-here
API_BASE_URL=https://your-tamu-endpoint/v1
MODEL=protected.Claude Sonnet 4.5

# Database (optional, defaults to SQLite)
DATABASE_URL=sqlite:///./agent_platform.db

# API Server
API_HOST=0.0.0.0
API_PORT=8000

# CORS (for frontend)
FRONTEND_URL=http://localhost:3000
```

---

## API Endpoints Summary

### Playground (Chat)
```
POST   /api/chat              - Send message, get response
WS     /api/ws/chat           - Streaming chat with real-time steps
```

### Runs (Inspection)
```
GET    /api/runs              - List run history
GET    /api/runs/{id}         - Get run with all steps
DELETE /api/runs/{id}         - Delete a run
```

### Tools (Management)
```
GET    /api/tools             - List all tools
GET    /api/tools/{id}        - Get tool schema
PUT    /api/tools/{id}        - Update tool (enable/disable)
POST   /api/tools             - Add custom tool (future)
DELETE /api/tools/{id}        - Remove custom tool (future)
```

### Workflows (Future)
```
GET    /api/workflows         - List saved workflows
POST   /api/workflows         - Create workflow
GET    /api/workflows/{id}    - Get workflow definition
PUT    /api/workflows/{id}    - Update workflow
DELETE /api/workflows/{id}    - Delete workflow
POST   /api/workflows/{id}/run - Execute workflow
```

---

## Future Enhancements

### Phase 2: Advanced Features
- **Streaming support** - Real-time step updates via WebSocket
- **Custom tools** - User-defined tools via API
- **Workflow builder** - Visual node-based workflows (for "Build Agents" page)
- **Multi-model support** - Switch between GPT-4, Claude, etc.
- **Rate limiting** - Prevent API abuse
- **Authentication** - User accounts and API keys

### Phase 3: Production Ready
- **PostgreSQL** - Replace SQLite for production
- **Redis** - Caching and job queues
- **Celery** - Background task processing
- **Docker** - Containerization
- **Tests** - Unit and integration tests
- **CI/CD** - Automated deployment
- **Monitoring** - Logging, metrics, alerts

### Phase 4: Enterprise
- **Team collaboration** - Share agents and workflows
- **Permissions** - Role-based access control
- **Audit logs** - Track all actions
- **Analytics dashboard** - Usage metrics, costs
- **SLA monitoring** - Uptime, latency tracking

---

## Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Initialize Database
```bash
python -c "from models.database import Base, engine; Base.metadata.create_all(engine)"
```

### 4. Run API Server
```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test API
```bash
# API docs
open http://localhost:8000/docs

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 5 + 10?"}'
```

### 6. Connect Frontend
Update React app to use API:
```javascript
const API_URL = 'http://localhost:8000/api';
```

---

## Conclusion

This architecture transforms the simple `agent.py` into a production-ready platform by:

1. **Adding persistence** - Database stores all runs and steps
2. **Providing APIs** - REST and WebSocket for frontend integration
3. **Enabling extensibility** - Plugin-based tool system
4. **Tracking execution** - Complete step-by-step history
5. **Supporting scale** - Async, concurrent run support

The design follows best practices:
- **Separation of concerns** - Clear boundaries between components
- **Single Responsibility** - Each module has one job
- **Open/Closed Principle** - Open for extension (new tools), closed for modification
- **Dependency Injection** - Makes testing and swapping implementations easy

The result is a platform that matches the ambitious vision of the `AgentPlatform.jsx` frontend! 🚀

