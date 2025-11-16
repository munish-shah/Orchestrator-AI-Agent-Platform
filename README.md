# AI Agent Platform 🤖

A complete, production-ready AI agent platform with FastAPI backend + React frontend. **Fully integrated and ready to use!**

## 🎯 What is This?

Transform a simple AI agent into a full-featured platform:
- ✅ **Model Playground** - Chat interface with real agent responses
- ✅ **Inspect Runs** - View complete execution history with every step
- ✅ **Manage Tools** - 3 tools ready (calculator, web search, file I/O)
- ✅ **Agent Engine** - Autonomous multi-step problem solving
- ✅ **Database** - Automatic run tracking in SQLite

**Status: Frontend ↔ Backend = CONNECTED** ✨

## 🏗️ Architecture

```
Frontend (React)  ←→  FastAPI Backend  ←→  Agent Engine  ←→  Tools
     │                      │                    │              │
     │                  Database            Run Tracker    Calculator
     │                 (SQLite)                              Web Search
     │                                                        File I/O
     └─── AgentPlatform.jsx
```

## 📁 Project Structure

```
AI-Agent/
├── agent.py                    # Original simple agent (reference)
├── api/
│   ├── main.py                # FastAPI app entry point
│   └── routes/
│       ├── playground.py      # POST /api/chat
│       ├── runs.py           # GET /api/runs, /api/runs/{id}
│       └── tools.py          # Tool CRUD endpoints
├── core/
│   ├── agent_engine.py       # Enhanced agent with tracking
│   ├── run_tracker.py        # Captures execution steps
│   └── tool_registry.py      # Dynamic tool discovery
├── models/
│   ├── database.py           # SQLAlchemy setup
│   ├── run.py               # Run & RunStep models
│   └── tool.py              # Tool model
├── tools/
│   ├── base.py              # BaseTool abstract class
│   ├── calculator.py        # Math operations
│   ├── web_search.py        # Web search (placeholder)
│   └── file_io.py           # File operations
├── Architecture.md          # Complete architecture docs
├── SETUP.md                # Setup instructions
└── requirements.txt        # Python dependencies
```

## 🚀 ONE COMMAND START

```bash
./start.sh
```

**That's it!** One command starts everything:
- ✅ Backend API (port 8000)
- ✅ Frontend UI (port 3000) 
- ✅ Auto-opens browser
- ✅ Both running in parallel

Press `Ctrl+C` to stop both servers.

### First Time Setup

Create `.env` file:
```bash
API_KEY=your-tamu-api-key
API_BASE_URL=https://your-endpoint/v1
MODEL=protected.Claude Sonnet 4.5
```

Then just run:
```bash
./start.sh
```

### Use the Platform

1. Open **http://localhost:3000**
2. Go to **Playground** tab
3. Type: "What is 10 + 5, then multiply by 3?"
4. Watch agent solve it step-by-step!
5. Go to **Inspect Runs** to see complete history
6. Go to **Manage Tools** to see available tools

**That's it!** Everything is connected and working. 🎉

---

## 🧪 Test Backend Only

If you want to test backend API directly:

```bash
# Health check
curl http://localhost:8000/health

# Chat with agent
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 5 + 10, then multiply by 3?"}'
```

### 5. View API Docs

Visit: http://localhost:8000/docs

## 🎨 Frontend Integration

Connect your React frontend (`AgentPlatform.jsx`):

```javascript
const API_URL = 'http://localhost:8000/api';

// Send message
const response = await fetch(`${API_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Your question here' })
});

const { response: answer, run_id } = await response.json();

// Get execution details
const run = await fetch(`${API_URL}/runs/${run_id}`);
const { steps } = await run.json();
```

## 🔧 API Endpoints

### Playground (Chat)
- `POST /api/chat` - Send message, get response + run_id
- `GET /api/chat/status` - Health check

### Runs (Inspection)
- `GET /api/runs` - List all runs (with pagination)
- `GET /api/runs/{id}` - Get run with all steps
- `DELETE /api/runs/{id}` - Delete a run
- `GET /api/runs/stats/summary` - Get statistics

### Tools (Management)
- `GET /api/tools` - List all tools
- `GET /api/tools/{id}` - Get tool schema
- `PUT /api/tools/{id}` - Update tool (enable/disable)
- `GET /api/tools/stats/summary` - Get tool stats

## 🛠️ Adding New Tools

1. Create new file in `tools/` directory:

```python
# tools/my_tool.py
from tools.base import BaseTool

class MyTool(BaseTool):
    name = "my_tool"
    display_name = "My Tool"
    description = "What my tool does"
    icon = "IconName"
    
    def get_parameters(self):
        return {
            "type": "object",
            "properties": {
                "param": {"type": "string", "description": "Parameter description"}
            },
            "required": ["param"]
        }
    
    def execute(self, param: str) -> str:
        # Your tool logic here
        return f"Result: {param}"
```

2. Restart server - tool auto-discovered! ✨

## 📊 How It Works

### Request Flow

1. **User sends message** via `/api/chat`
2. **API creates Run** and RunTracker
3. **Agent Engine executes** with tool registry
4. **Each step is tracked**:
   - User request
   - Agent thoughts
   - Tool calls (with params)
   - Tool results
   - Agent response
5. **Run saved to database**
6. **Frontend gets response + run_id**
7. **User can inspect** via `/api/runs/{id}`

### Example Run Timeline

```
User Request: "What is 5 + 10, then multiply by 3?"
  ↓
Agent Thought: "Need to add 5 + 10"
  ↓
Tool Call: calculator(add, 5, 10)
  ↓
Tool Result: "5 + 10 = 15"
  ↓
Agent Thought: "Now multiply 15 by 3"
  ↓
Tool Call: calculator(multiply, 15, 3)
  ↓
Tool Result: "15 * 3 = 45"
  ↓
Agent Response: "The result is 45"
```

## 🔍 Database

SQLite database (`agent_platform.db`) stores:
- **runs** - All agent executions
- **run_steps** - Detailed step-by-step history
- **tools** - Tool configurations (enabled/disabled)

## 📚 Documentation

- **README.md** (this file) - Complete setup and usage guide
- **Architecture.md** - Deep technical architecture and design decisions
- **API Docs** - http://localhost:8000/docs (interactive, auto-generated)

## 🎯 Features

- ✅ **RESTful API** - Clean, documented endpoints
- ✅ **Tool Calling** - Dynamic tool discovery and execution
- ✅ **Run Tracking** - Complete execution history
- ✅ **Database Storage** - Persistent run history
- ✅ **CORS Enabled** - Ready for React frontend
- ✅ **Type Safe** - Pydantic models for validation
- ✅ **Auto Documentation** - Swagger UI at `/docs`
- ✅ **Extensible** - Easy to add new tools

## 🔜 Next Steps

### Phase 2 (Enhancements)
- [ ] WebSocket streaming for real-time updates
- [ ] Multi-model support (GPT-4, Claude, Llama)
- [ ] Custom tool creation via API
- [ ] Workflow builder (visual node editor)
- [ ] Rate limiting and authentication

### Phase 3 (Production)
- [ ] PostgreSQL for production
- [ ] Redis caching
- [ ] Docker containerization
- [ ] Monitoring and logging
- [ ] CI/CD pipeline

## 🤝 Contributing

1. Create new tool in `tools/`
2. Add API endpoint in `api/routes/`
3. Update documentation
4. Test with frontend

## 📝 License

MIT

## 🙋 Questions?

- Check `Architecture.md` for deep dive
- Visit `/docs` for API reference
- Run tests: `pytest` (coming soon)

---

**Built with**: FastAPI, SQLAlchemy, OpenAI SDK, Pydantic

**Powers**: AgentPlatform.jsx frontend 🚀

