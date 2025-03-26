import json
import os
import sys

# Define a completely fallback implementation that doesn't depend on the Google API
def convert_to_python(instruction):
    """Convert English instruction to Python code without external dependencies"""
    try:
        # Try to load the Google API if available
        import google.generativeai as genai
        
        # Initialize with API key
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            return f"# Error: GEMINI_API_KEY environment variable not set\n# Your instruction: {instruction}"
        
        # Configure Gemini API
        genai.configure(api_key=api_key)
        
        # Get available models
        try:
            # Try to list models first to log what's available
            models = genai.list_models()
            model_names = [model.name for model in models]
            print(f"Available Gemini models: {model_names}")
            
            # Choose the best available model
            if "models/gemini-1.5-pro" in model_names:
                model_name = "gemini-1.5-pro"
            elif "models/gemini-1.0-pro" in model_names:
                model_name = "gemini-1.0-pro"
            else:
                # Use latest available model that contains "pro"
                pro_models = [m for m in model_names if "pro" in m.lower()]
                if pro_models:
                    # Remove "models/" prefix if present
                    model_name = pro_models[0].replace("models/", "")
                else:
                    model_name = "gemini-pro"  # Default fallback
            
            print(f"Using Gemini model: {model_name}")
        except Exception as e:
            print(f"Error listing models: {e}")
            # Default to gemini-pro if listing models fails
            model_name = "gemini-pro"
        
        # Initialize model with the selected name
        model = genai.GenerativeModel(model_name)
        
        # Load examples from dataset
        examples = load_dataset()
        
        # Create prompt
        prompt = f"""
        I am creating a programming language where English translates into code.
        Here are some examples:\n{examples}\n
        Now, convert this English instruction into code:
        '{instruction}'
        
        Return only the Python code without any explanations or markdown formatting.
        """
        
        # Send request with explicit generation config
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )
        
        # Clean up the response
        if hasattr(response, 'text'):
            code = response.text.strip()
        else:
            # Handle different response formats
            content = getattr(response, 'parts', [response])[0]
            code = str(content).strip()
        
        # Remove markdown code block formatting if present
        if code.startswith("```python") and code.endswith("```"):
            code = code[10:-3].strip()
        elif code.startswith("```") and code.endswith("```"):
            code = code[3:-3].strip()
            
        return code
    
    except ImportError as e:
        print(f"ImportError: {e}")
        # Fallback to simple code generation when Google API is not available
        return f"""# Simple code generated for: {instruction}
print("Processing: {instruction}")

# This is a fallback implementation because the AI service is not available
def process_instruction():
    print("Your instruction would be processed here.")
    return "Result would be here"

result = process_instruction()
print(result)
"""
    except Exception as e:
        print(f"Error in convert_to_python: {e}")
        return f"# Error generating code: {str(e)}\n# Your instruction: {instruction}"

def load_dataset():
    """Load and format the dataset from dataset.json"""
    try:
        # Get the absolute path to the dataset file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(current_dir, "dataset.json")
        
        # Load dataset.json file
        with open(dataset_path, "r") as file:
            dataset = json.load(file)
        
        # Ensure dataset is a list
        if isinstance(dataset, dict):
            dataset = [dataset]
        
        # Format dataset into a structured prompt
        examples = "\n".join([
            f"English: {item.get('english_command', 'No instruction')}\nCode:\n{item.get('python_code', 'No code')}\n"
            for item in dataset
        ])
        
        return examples
    except Exception as e:
        # Return a simple example if dataset cannot be loaded
        return """
English: Print hello world
Code:
print("Hello, World!")

English: Create a list of numbers from 1 to 10
Code:
numbers = list(range(1, 11))
print(numbers)
"""
