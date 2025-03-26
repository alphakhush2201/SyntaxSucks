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
        
        # Try to use Gemini 2.0 Flash specifically
        try:
            # Try to list models first to check if gemini-2.0-flash is available
            models = genai.list_models()
            model_names = [model.name for model in models]
            print(f"Available Gemini models: {model_names}")
            
            # Look for gemini-2.0-flash or similar
            flash_models = [m for m in model_names if "flash" in m.lower()]
            if flash_models:
                # Use the first available flash model (preferably 2.0)
                gemini_2_flash = [m for m in flash_models if "2.0" in m or "2-0" in m]
                if gemini_2_flash:
                    model_name = gemini_2_flash[0].replace("models/", "")
                else:
                    model_name = flash_models[0].replace("models/", "")
            else:
                # Fallback to gemini-2.0-flash even if not in list (might work anyway)
                model_name = "gemini-2.0-flash"
            
            print(f"Using Gemini model: {model_name}")
        except Exception as e:
            print(f"Error listing models: {e}")
            # Default to gemini-2.0-flash if listing models fails
            model_name = "gemini-2.0-flash"
        
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
