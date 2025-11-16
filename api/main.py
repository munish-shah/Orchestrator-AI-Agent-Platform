"""FastAPI main application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import playground, runs, tools
from models.database import engine, Base, init_db

# Create database tables
init_db()

# Initialize FastAPI app
app = FastAPI(
    title="AI Agent Platform API",
    description="Backend API for Orchestrator AI Agent Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Create React App
        "http://localhost:5173",    # Vite
        "http://localhost:8080",    # Alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(playground.router, prefix="/api", tags=["Playground"])
app.include_router(runs.router, prefix="/api", tags=["Runs"])
app.include_router(tools.router, prefix="/api", tags=["Tools"])


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "AI Agent Platform API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "api": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

