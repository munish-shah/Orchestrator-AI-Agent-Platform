#!/bin/bash
# 🚀 ONE COMMAND TO RULE THEM ALL
# Starts both Backend (FastAPI) and Frontend (React/Vite)

echo "🤖 Starting AI Agent Platform..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Create .env with your API credentials:"
    echo ""
    echo "   API_KEY=your-key"
    echo "   API_BASE_URL=https://your-endpoint/v1"
    echo "   MODEL=protected.Claude Sonnet 4.5"
    echo ""
    exit 1
fi

# Check Node version (compatible with Node 18+)
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ ! -z "$NODE_VERSION" ] && [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js $NODE_VERSION detected. Please upgrade to Node 18+"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}  BACKEND SETUP (Python/FastAPI)${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Backend setup
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing Python dependencies..."
pip install -q -r requirements.txt

echo "💾 Initializing database..."
python -c "from models.database import init_db; init_db()" 2>/dev/null

echo ""
echo "${GREEN}✅ Backend ready!${NC}"
echo ""

# Frontend setup
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}  FRONTEND SETUP (React/Vite)${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    npm install --silent
fi

echo ""
echo "${GREEN}✅ Frontend ready!${NC}"
echo ""

cd ..

# Start both servers
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}  STARTING SERVERS${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${GREEN}🚀 Backend API:${NC}  http://localhost:8000"
echo "${GREEN}🎨 Frontend UI:${NC}  http://localhost:3000"
echo "${GREEN}📚 API Docs:${NC}     http://localhost:8000/docs"
echo ""
echo "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo ""
    echo "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
uvicorn api.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

# Wait for both processes
wait

