
import os
from openai import OpenAI
from dotenv import load_dotenv 


load_dotenv()

client = OpenAI(
    api_key=os.getenv("API_KEY"),
    base_url=os.getenv("API_BASE_URL")
)

def calculator(operation, x, y):

    if operation == "add":
        return f'{x} + {y} = {x+y}'
    elif operation == "multiply":
        return f'{x} * {y} = {x*y}'
    elif operation == "subtract":
        return f'{x} - {y} = {x-y}'
    elif operation == "divide":
        return f'{x} / {y} = {x/y}'
    elif operation == "power":
        return f'{x}^{y} = {x**y}'
    
        
    return "KYRIEEEEEEEEEEE"

def run_agent(user_goal):

    tools = [{
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Perform any mathematic operation",
            "parameters": {
                "type": "object",
                "properties": {
                    "operation": {"type": "string", "enum": ["add", "multiply", "subtract", "divide", "power", ""]},
                    "x": {"type": "number"},
                    "y": {"type": "number"}
                },      
                "required": ["operation", "x", "y"]
            }
        }
    }]

    messages = [{"role": "user", "content": user_goal}]
    print(f"\nUser asks: {user_goal}")
    
    iteration = 0
    while iteration < 10:
        iteration += 1
        print(f"\n--- Iteration {iteration} ---")
        

        response = client.chat.completions.create(
            model=os.getenv('MODEL'),
            messages=messages,
            tools=tools,
            stream=False
        )
        
        query = response.choices[0].message
        messages.append(query)  # Remember method
        print(f"Got response from AI")
        print(query)
        
        # Use the tool if AI requests it
        if query.tool_calls:
            print("AI decided to use a tool!")
            import json
            tool_call = query.tool_calls[0]
            args = json.loads(tool_call.function.arguments)
            result = calculator(**args)
            print(f"Tool used: {tool_call.function.name}({args})")
            print(f"Result: {result}")
            
            # Send result back to AI
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })
        else:
            # KYRIEBOT is done
            return query.content
    
    return "Max iterations reached"

if __name__ == "__main__":

    run_agent("What is 5 + 10, then multiply that result by 3, and put it to the power of 8, then divide all of that by 2, ?")