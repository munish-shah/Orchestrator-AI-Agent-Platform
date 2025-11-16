"""Enhanced agent engine with run tracking"""
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from core.run_tracker import RunTracker
from core.tool_registry import ToolRegistry

load_dotenv()


class AgentEngine:
    """
    Enhanced version of agent.py with full tracking.
    Executes agent loop while capturing all steps for inspection.
    """
    
    def __init__(self, tracker: RunTracker, tool_registry: ToolRegistry):
        """
        Initialize agent engine.
        
        Args:
            tracker: RunTracker for capturing execution steps
            tool_registry: ToolRegistry for tool execution
        """
        self.tracker = tracker
        self.tool_registry = tool_registry
        
        # Initialize OpenAI client (same as agent.py)
        self.client = OpenAI(
            api_key=os.getenv("API_KEY"),
            base_url=os.getenv("API_BASE_URL")
        )
        
        self.model = os.getenv("MODEL", "gpt-4")
        self.max_iterations = int(os.getenv("MAX_ITERATIONS", "10"))
    
    async def run(self, user_goal: str) -> str:
        """
        Execute agent loop with full tracking.
        This is the enhanced version of run_agent() from agent.py.
        
        Args:
            user_goal: User's question/request
            
        Returns:
            str: Final agent response
        """
        # Track user request
        self.tracker.add_step({
            'type': 'user-request',
            'content': user_goal
        })
        
        # Initialize conversation
        messages = [{"role": "user", "content": user_goal}]
        
        # Get tool schemas
        tool_schemas = self.tool_registry.get_schemas()
        
        # Agent loop (same structure as agent.py)
        iteration = 0
        while iteration < self.max_iterations:
            iteration += 1
            
            try:
                # Call LLM (same as agent.py)
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=tool_schemas,
                    stream=False
                )
                
                assistant_message = response.choices[0].message
                messages.append(assistant_message)
                
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

