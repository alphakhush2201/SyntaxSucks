import json
import os
import sys
import requests

SUPPORTED_LANGUAGES = {
    'python': {
        'name': 'Python',
        'extension': 'py',
        'comment': '#'
    },
    'javascript': {
        'name': 'JavaScript',
        'extension': 'js',
        'comment': '//'
    },
    'java': {
        'name': 'Java',
        'extension': 'java',
        'comment': '//'
    },
    'cpp': {
        'name': 'C++',
        'extension': 'cpp',
        'comment': '//'
    },
    'ruby': {
        'name': 'Ruby',
        'extension': 'rb',
        'comment': '#'
    }
}

def convert_to_code(instruction, target_language='python'):
    """Convert English instruction to code in the specified language"""
    if target_language not in SUPPORTED_LANGUAGES:
        return f"# Error: Unsupported language '{target_language}'\n# Supported languages: {', '.join(SUPPORTED_LANGUAGES.keys())}"
    
    try:
        # Try to load the Google API if available
        import google.generativeai as genai
        
        # Initialize with API key
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            return f"# Error: GEMINI_API_KEY environment variable not set\n# Your instruction: {instruction}"
            
        # Load examples from dataset
        examples = load_dataset(target_language)
        
        # Create prompt
        prompt = f"""
        I am creating a programming language where English translates into {SUPPORTED_LANGUAGES[target_language]['name']} code.
        Here are some examples:\n{examples}\n
        Now, convert this English instruction into {SUPPORTED_LANGUAGES[target_language]['name']} code:
        '{instruction}'
        
        Return only the code without any explanations or markdown formatting.
        Make sure the code follows {SUPPORTED_LANGUAGES[target_language]['name']} syntax and best practices.
        """
        
        # Try with simplified approach first
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            code = response.text.strip()
            print(f"Successfully used gemini-2.0-flash model for {target_language}")
            
        except Exception as e:
            print(f"First approach failed: {e}")
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("models/gemini-pro")
                response = model.generate_content(prompt)
                code = response.text.strip()
                print(f"Successfully used models/gemini-pro model for {target_language}")
                
            except Exception as e:
                print(f"Second approach failed: {e}")
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
                    response.raise_for_status()
                    
                    data = response.json()
                    code = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                    if not code:
                        raise ValueError("No text in response")
                        
                    print(f"Successfully used direct HTTP API for {target_language}")
                except Exception as direct_error:
                    print(f"Direct API call failed: {direct_error}")
                    return f"""{SUPPORTED_LANGUAGES[target_language]['comment']} Error: All API approaches failed
{SUPPORTED_LANGUAGES[target_language]['comment']} Your instruction was: {instruction}

{get_fallback_code(target_language)}
"""
        
        # Remove markdown code block formatting if present
        if code.startswith(f"```{target_language}") and code.endswith("```"):
            code = code[len(target_language) + 3:-3].strip()
        elif code.startswith("```") and code.endswith("```"):
            code = code[3:-3].strip()
            
        return code
    
    except ImportError as e:
        print(f"ImportError: {e}")
        return f"""{SUPPORTED_LANGUAGES[target_language]['comment']} ImportError: Google GenerativeAI package not available
{SUPPORTED_LANGUAGES[target_language]['comment']} Your instruction: {instruction}

{get_fallback_code(target_language)}
"""
    except Exception as e:
        print(f"Critical error in convert_to_code: {e}")
        return f"{SUPPORTED_LANGUAGES[target_language]['comment']} Error generating code: {str(e)}\n{SUPPORTED_LANGUAGES[target_language]['comment']} Your instruction: {instruction}"

def get_fallback_code(language):
    """Return language-specific fallback code"""
    if language == 'python':
        return '''print("Hello, World!")
print("Sorry, the AI code generation service is currently unavailable.")'''
    elif language == 'javascript':
        return '''console.log("Hello, World!");
console.log("Sorry, the AI code generation service is currently unavailable.");'''
    elif language == 'java':
        return '''public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Sorry, the AI code generation service is currently unavailable.");
    }
}'''
    elif language == 'cpp':
        return '''#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    std::cout << "Sorry, the AI code generation service is currently unavailable." << std::endl;
    return 0;
}'''
    elif language == 'ruby':
        return '''puts "Hello, World!"
puts "Sorry, the AI code generation service is currently unavailable."'''
    return "// Error: Unsupported language"

def load_dataset(language='python'):
    """Load and format the dataset from dataset.json"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(current_dir, f"dataset_{language}.json")
        
        # Try to load language-specific dataset
        try:
            with open(dataset_path, "r") as file:
                dataset = json.load(file)
        except FileNotFoundError:
            # Fall back to Python dataset if language-specific one doesn't exist
            dataset_path = os.path.join(current_dir, "dataset.json")
            with open(dataset_path, "r") as file:
                dataset = json.load(file)
        
        if isinstance(dataset, dict):
            dataset = [dataset]
        
        examples = "\n".join([
            f"English: {item.get('english_command', 'No instruction')}\nCode:\n{item.get('code', 'No code')}\n"
            for item in dataset
        ])
        
        return examples
    except Exception as e:
        # Return simple examples for the target language
        return get_simple_examples(language)

def get_simple_examples(language):
    """Return language-specific simple examples"""
    if language == 'python':
        return """
English: Print hello world
Code:
print("Hello, World!")

English: Create a list of numbers from 1 to 10
Code:
numbers = list(range(1, 11))
print(numbers)
"""
    elif language == 'javascript':
        return """
English: Print hello world
Code:
console.log("Hello, World!");

English: Create an array of numbers from 1 to 10
Code:
const numbers = Array.from({length: 10}, (_, i) => i + 1);
console.log(numbers);
"""
    elif language == 'java':
        return """
English: Print hello world
Code:
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}

English: Create an array of numbers from 1 to 10
Code:
public class Main {
    public static void main(String[] args) {
        int[] numbers = new int[10];
        for(int i = 0; i < 10; i++) {
            numbers[i] = i + 1;
        }
        System.out.println(Arrays.toString(numbers));
    }
}
"""
    elif language == 'cpp':
        return """
English: Print hello world
Code:
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}

English: Create an array of numbers from 1 to 10
Code:
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers(10);
    for(int i = 0; i < 10; i++) {
        numbers[i] = i + 1;
    }
    for(int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    return 0;
}
"""
    elif language == 'ruby':
        return """
English: Print hello world
Code:
puts "Hello, World!"

English: Create an array of numbers from 1 to 10
Code:
numbers = (1..10).to_a
puts numbers
"""
    return "// Error: Unsupported language"
