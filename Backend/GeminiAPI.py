import json
import os
from google import genai

# Initialize the Gemini client with API key from environment variable
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyAYwekcwKDIWO0lJivTkDEXVflGfgEekfI")
client = genai.Client(api_key=api_key)

def load_dataset():
    """Load and format the dataset from dataset.json"""
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
    
    # Send request to Gemini-2 Flash
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
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
