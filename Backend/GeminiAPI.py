import json
import os
import sys
import requests

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
        
        # Try with simplified approach first - don't overcomplicate with model selection
        try:
            # Configure Gemini API
            genai.configure(api_key=api_key)
            # Use a model we know exists in the API
            model = genai.GenerativeModel("gemini-pro")
            
            # Generate content with simple config
            response = model.generate_content(prompt)
            code = response.text.strip()
            
            # If we get here, it worked
            print("Successfully used gemini-pro model")
            
        except Exception as e:
            print(f"First approach failed: {e}")
            # Fall back to alternative model name
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("models/gemini-pro")
                response = model.generate_content(prompt)
                code = response.text.strip()
                print("Successfully used models/gemini-pro model")
                
            except Exception as e:
                print(f"Second approach failed: {e}")
                # Last resort - Fall back to direct HTTP request to the API
                try:
                    print("Trying direct HTTP API call")
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
                    headers = {'Content-Type': 'application/json'}
                    payload = {
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }]
                    }
                    
                    response = requests.post(url, headers=headers, json=payload)
                    response.raise_for_status()  # Raise exception for HTTP errors
                    
                    data = response.json()
                    code = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                    if not code:
                        raise ValueError("No text in response")
                        
                    print("Successfully used direct HTTP API")
                except Exception as direct_error:
                    print(f"Direct API call failed: {direct_error}")
                    # As a last resort, return a simple code example
                    return f"""# Error: All API approaches failed
# Your instruction was: {instruction}

print("Hello, World!")
print("Sorry, the AI code generation service is currently unavailable.")
"""
        
        # Remove markdown code block formatting if present
        if code.startswith("```python") and code.endswith("```"):
            code = code[10:-3].strip()
        elif code.startswith("```") and code.endswith("```"):
            code = code[3:-3].strip()
            
        return code
    
    except ImportError as e:
        print(f"ImportError: {e}")
        # Fallback to simple code generation when Google API is not available
        return f"""# ImportError: Google GenerativeAI package not available
# Your instruction: {instruction}

print("Processing: {instruction}")

# This is a fallback implementation
def process_instruction():
    print("Your instruction would be processed here.")
    return "Result would be here"

result = process_instruction()
print(result)
"""
    except Exception as e:
        print(f"Critical error in convert_to_python: {e}")
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
