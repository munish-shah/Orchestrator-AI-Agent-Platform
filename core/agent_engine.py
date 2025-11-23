"""Enhanced agent engine with run tracking"""
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from core.run_tracker import RunTracker
from core.tool_registry import ToolRegistry
from core.model_config import get_model_id, DEFAULT_MODEL

load_dotenv()


class AgentEngine:
    """
    Enhanced version of agent.py with full tracking.
    Executes agent loop while capturing all steps for inspection.
    """
    
    def __init__(self, tracker: RunTracker, tool_registry: ToolRegistry, model_id: str = None):
        """
        Initialize agent engine.
        
        Args:
            tracker: RunTracker for capturing execution steps
            tool_registry: ToolRegistry for tool execution
            model_id: Optional model ID override
        """
        self.tracker = tracker
        self.tool_registry = tool_registry
        
        # Initialize OpenAI client (same as agent.py)
        self.client = OpenAI(
            api_key=os.getenv("API_KEY"),
            base_url=os.getenv("API_BASE_URL")
        )
        
        # Use provided model ID or fallback to default from config
        self.model = model_id or get_model_id(DEFAULT_MODEL)
        self.max_iterations = int(os.getenv("MAX_ITERATIONS", "10"))
    
    async def run(self, user_goal: str, allowed_tools: list[str] = None) -> str:
        """
        Execute agent loop with full tracking.
        This is the enhanced version of run_agent() from agent.py.
        
        Args:
            user_goal: User's question/request
            allowed_tools: Optional list of tool names to enable for this run
            
        Returns:
            str: Final agent response
        """
        # Track user request
        self.tracker.add_step({
            'type': 'user-request',
            'content': user_goal
        })
        
        # Initialize conversation
        system_prompt = (
            "You are a helpful AI agent. "
            "Use the provided tools to solve problems. "
            "Do NOT invent new tools. Only use the tools explicitly provided to you. "
            "When you have the answer, provide it directly in your response. "
            "Do NOT use LaTeX formatting (e.g. $x$) for simple math. Use plain text."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_goal}
        ]
        
        # Get tool schemas
        # Get tool schemas
        all_schemas = self.tool_registry.get_schemas()
        
        if allowed_tools and "auto" in allowed_tools:
            # Auto mode: Use all tools, let agent decide
            tool_schemas = all_schemas
            tool_choice = "auto"
        elif allowed_tools:
            # Specific tools selected: Filter and force usage
            tool_schemas = [s for s in all_schemas if s['function']['name'] in allowed_tools]
            # Force tool usage if specific tools are requested
            tool_choice = "required" if tool_schemas else "auto"
        else:
            # No tools selected: Disable tools
            tool_schemas = None
            tool_choice = None
        
        # Agent loop (same structure as agent.py)
        iteration = 0
        while iteration < self.max_iterations:
            iteration += 1
            
            try:
                # Call LLM (same as agent.py)
                # Only force tool usage on the first iteration if requested
                current_tool_choice = tool_choice if iteration == 1 else "auto"
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=tool_schemas,
                    tool_choice=current_tool_choice,
                    stream=False
                )
                
                assistant_message = response.choices[0].message
                
                # Handle compatibility: Ensure content is not None
                # Some providers (like Gemini) require content field even for tool calls
                msg_dict = {
                    "role": assistant_message.role,
                    "content": assistant_message.content if assistant_message.content is not None else ""
                }
                
                if assistant_message.tool_calls:
                    msg_dict["tool_calls"] = assistant_message.tool_calls
                
                messages.append(msg_dict)
                
                # Check if AI wants to use a tool
                if assistant_message.tool_calls:
                    # Track agent thinking
                    tool_names = [tc.function.name for tc in assistant_message.tool_calls]
                    self.tracker.add_step({
                        'type': 'agent-thought',
                        'content': f"Using tool(s): {', '.join(tool_names)}"
                    })
                    
                    # Execute each tool call
                    for tool_call in assistant_message.tool_calls:
                        tool_name = tool_call.function.name
                        args = json.loads(tool_call.function.arguments)
                        
                        # Track tool call
                        self.tracker.add_step({
                            'type': 'tool-call',
                            'toolName': tool_name,
                            'params': args
                        })
                        
                        # Execute tool via registry
                        try:
                            result = self.tool_registry.execute(tool_name, **args)
                        except Exception as e:
                            result = f"Error executing tool: {str(e)}"
                        
                        # Track tool result
                        self.tracker.add_step({
                            'type': 'tool-result',
                            'toolName': tool_name,
                            'result': str(result)
                        })
                        
                        # Add result to conversation
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": str(result)
                        })
                    
                    # Continue loop - AI will process tool results
                    continue
                
                else:
                    # AI doesn't need more tools - has final answer
                    final_response = assistant_message.content or "No response"
                    
                    self.tracker.add_step({
                        'type': 'agent-response',
                        'content': final_response
                    })
                    
                    return final_response
            
            except Exception as e:
                error_msg = f"Error in iteration {iteration}: {str(e)}"
                self.tracker.add_step({
                    'type': 'agent-response',
                    'content': error_msg
                })
                raise
        
        # Max iterations reached
        max_iter_msg = f"Reached maximum iterations ({self.max_iterations})"
        self.tracker.add_step({
            'type': 'agent-response',
            'content': max_iter_msg
        })
        return max_iter_msg
    
    def __repr__(self):
        return f"<AgentEngine: model={self.model}, tools={len(self.tool_registry)}>"

