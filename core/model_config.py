"""
Model Configuration
Define available models and their backend IDs here.
"""

# Dictionary mapping display names to backend model IDs
MODEL_MAPPINGS = {
    "Claude Sonnet 4.5": "protected.Claude Sonnet 4.5",
    
    # --- Top 3 Best Models (Reasoning/Capability) from the list ---
    "GPT-5.1": "protected.gpt-5.1",
    "Gemini 2.5 Pro": "protected.gemini-2.5-pro",
    "Claude Opus 4.1": "protected.Claude Opus 4.1",
    
    # --- Top 3 Fastest Models (Latency/Throughput) from the list ---
    "Gemini 2.5 Flash Lite": "protected.gemini-2.5-flash-lite",
    "Gemini 2.5 Flash": "protected.gemini-2.5-flash",
    "Claude Haiku 4.5": "protected.Claude-Haiku-4.5",
}

# Default model if none selected
DEFAULT_MODEL = "Gemini 2.5 Flash"

def get_model_id(display_name: str) -> str:
    """Get backend ID for a display name, or return default."""
    return MODEL_MAPPINGS.get(display_name, MODEL_MAPPINGS[DEFAULT_MODEL])
