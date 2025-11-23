# AI Agent Platform

A modern, "agentic" AI platform featuring a React frontend and a Python/FastAPI backend. This system allows users to interact with LLMs (Claude, Gemini, GPT) that have access to dynamic custom built tools.

## Project Flow

1.  **Frontend (React)**: The user interacts with the "Playground" UI. They select a model (e.g., Gemini 2.5 Flash) and optional tools (e.g., Calculator).
2.  **API (FastAPI)**: The frontend sends the message, model ID, and selected tools to the `/api/chat` endpoint.
3.  **Agent Engine**: The backend `AgentEngine` initializes the conversation.
    *   It constructs a system prompt (enforcing plain text math, no hallucinations).
    *   It registers the selected tools from the `ToolRegistry`.
4.  **LLM Interaction**: The engine sends the conversation history to the LLM.
    *   **Reasoning**: The LLM decides if it needs to use a tool.
    *   **Tool Execution**: If a tool is called, the engine executes the Python function in `tools/` and feeds the result back to the LLM.
    *   **Loop**: This continues (up to `MAX_ITERATIONS`) until the LLM provides a final answer.
5.  **Response**: The final answer is streamed back to the frontend and displayed to the user.

## Architecture & Key Files

### Core (`/core`)
The brain of the operation.
*   **`agent_engine.py`**: The main logic loop. Handles LLM communication, tool execution, and run tracking.
*   **`tool_registry.py`**: Dynamically discovers and loads tools from the `tools/` directory.
*   **`model_config.py`**: Central configuration for available models and their backend IDs.
*   **`run_tracker.py`**: Records every step (thought, tool call, result) for the "Inspect Runs" view.

### API (`/api`)
The bridge between frontend and core.
*   **`main.py`**: FastAPI entry point.
*   **`routes/playground.py`**: Handles chat requests (`/chat`) and model listing (`/models`).
*   **`routes/tools.py`**: Manages tool discovery and settings.

### Tools (`/tools`)
Drop-in capabilities for the agent.
*   **`base.py`**: Base class that all tools must inherit from.
*   **`calculator.py`**: Calculator tool. To add a new tool, simply create a new `.py` file here inheriting from `BaseTool`.

### Frontend (`/frontend`)
A modern React application built with Vite and Tailwind CSS.
*   **`src/pages/Playground.jsx`**: The main chat interface with model/tool selectors.
*   **`src/pages/Runs.jsx`**: A timeline view to inspect the agent's thought process.
*   **`src/pages/Dashboard.jsx`**: Real-time metrics and quick actions.
*   **`src/components/layout/Sidebar.jsx`**: Collapsible navigation.

## Quick Start

1.  **Start the Stack**:
    ```bash
    ./start.sh
    ```
    This script starts both the Backend (Port 8000) and Frontend (Port 3000).

2.  **Access**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.
