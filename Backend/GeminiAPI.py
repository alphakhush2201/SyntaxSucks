import json
import os
import sys

# Try importing genai with proper error handling
try:
    from google import generativeai as genai
except ImportError as e:
    print(f"Error importing Google Generative AI: {e}")
    print("This might be due to missing dependencies or environment issues")
    # Define a fallback function that returns a message about the error
    def convert_to_python(instruction):
        return f"# Error: Google Generative AI (genai) module could not be imported.\n# Please check your installation and dependencies.\n# Original error: {e}"
    # Skip the rest of the file
    sys.exit(1)

# Initialize the Gemini client with API key from environment variable
api_key = os.environ.get("GEMINI_API_KEY", "")
if not api_key:
    print("Warning: GEMINI_API_KEY environment variable not set")

try:
    client = genai.GenerativeModel(model_name="gemini-pro")
except Exception as e:
    print(f"Error initializing Gemini client: {e}")
    # Define a fallback function
    def convert_to_python(instruction):
        return f"# Error initializing Gemini client.\n# Please check your API key and connection.\n# Original error: {e}"
    # Skip the rest of the file
    sys.exit(1)

def load_dataset():
    """Load and format the dataset from dataset.json"""
    # Get the absolute path to the dataset file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "dataset.json")
    
    # Load dataset.json file
    try:
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
        print(f"Error loading dataset: {e}")
        return "# Example 1\nEnglish: Print hello world\nCode:\nprint('Hello, World!')\n"

def convert_to_python(instruction):
    """Convert English instruction to Python code using Gemini API"""
    # Load and format examples from dataset
    examples = load_dataset()
    
    # Create the prompt with the instruction
    prompt = f"""
    I am creating a programming language where English translates into code.
    Here are some examples:\n{examples}\n
    Now, convert this English instruction into code:
    '{instruction}'
    
    Return only the Python code without any explanations or markdown formatting.
    """
    
    # Send request to Gemini API
    try:
        response = genai.generate_text(
            model="gemini-pro",
            prompt=prompt,
            temperature=0.2,
            max_output_tokens=1024,
        )
        
        # Extract the code from the response
        code = response.text.strip()
        
        # Remove markdown code block formatting if present
        if code.startswith("```python") and code.endswith("```"):
            code = code[10:-3].strip()
        elif code.startswith("```") and code.endswith("```"):
            code = code[3:-3].strip()
            
        return code
    except Exception as e:
        return f"# Error generating code: {str(e)}"
