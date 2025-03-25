import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

function Documentation({ onClose }) {
  const [activeSection, setActiveSection] = useState('about');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Documentation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close documentation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-full overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-1/4 border-r border-gray-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('about')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeSection === 'about' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                About SyntaxSucks
              </button>
              <button
                onClick={() => setActiveSection('how-it-works')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeSection === 'how-it-works' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                How It Works
              </button>
              <button
                onClick={() => setActiveSection('examples')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeSection === 'examples' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                Examples
              </button>
              <button
                onClick={() => setActiveSection('faq')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeSection === 'faq' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                FAQ
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="w-3/4 p-6 overflow-y-auto">
            {activeSection === 'about' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-blue-400">About SyntaxSucks</h2>
                <p>
                  SyntaxSucks is an innovative tool designed to bridge the gap between natural language and Python code. 
                  Our mission is to make programming more accessible by allowing users to express their ideas in plain English 
                  and have them automatically converted into functional Python code.
                </p>
                <p>
                  Whether you're a beginner learning to code, an experienced developer looking to prototype ideas quickly, 
                  or someone who knows what they want to accomplish but struggles with syntax, SyntaxSucks is here to help 
                  you overcome the barriers of programming language syntax.
                </p>
                <h3 className="text-lg font-semibold mt-6">Our Goal</h3>
                <p>
                  Our goal is to democratize programming by making it more intuitive and accessible. We believe that 
                  the ability to create with code shouldn't be limited by one's knowledge of syntax, but rather by 
                  their creativity and problem-solving abilities.
                </p>
              </div>
            )}

            {activeSection === 'how-it-works' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-blue-400">How It Works</h2>
                <p>
                  SyntaxSucks uses advanced AI technology to translate your English instructions into Python code. 
                  Here's how the process works:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Input your instructions:</strong> Describe what you want your code to do in plain English. 
                    Be as specific as possible about the functionality you need.
                  </li>
                  <li>
                    <strong>AI translation:</strong> Our system analyzes your instructions using a large language model 
                    trained on programming patterns and natural language.
                  </li>
                  <li>
                    <strong>Code generation:</strong> The AI generates Python code that implements your described functionality.
                  </li>
                  <li>
                    <strong>Review and run:</strong> You can review the generated code, make edits if needed, and run it 
                    directly in the browser to see the results.
                  </li>
                </ol>
                <p className="mt-4">
                  The technology behind SyntaxSucks combines natural language processing with code generation models 
                  to understand your intent and produce appropriate Python code that follows best practices.
                </p>
              </div>
            )}

            {activeSection === 'examples' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-blue-400">Examples</h2>
                <p>
                  Here are some examples of English instructions and the Python code they generate:
                </p>
                
                <div className="bg-gray-900 rounded-lg p-4 mt-4">
                  <h3 className="text-md font-semibold text-blue-300">Example 1: Data Processing</h3>
                  <div className="mt-2">
                    <p className="text-gray-300 font-semibold">English:</p>
                    <p className="bg-gray-800 p-2 rounded mt-1">Read a CSV file named 'data.csv', calculate the average of the 'score' column, and print the result.</p>
                    
                    <p className="text-gray-300 font-semibold mt-3">Python:</p>
                    <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                      <code>
{`import pandas as pd

# Read the CSV file
df = pd.read_csv('data.csv')

# Calculate the average of the 'score' column
average_score = df['score'].mean()

# Print the result
print(f"The average score is: {average_score}")`}
                      </code>
                    </pre>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 mt-6">
                  <h3 className="text-md font-semibold text-blue-300">Example 2: Web Scraping</h3>
                  <div className="mt-2">
                    <p className="text-gray-300 font-semibold">English:</p>
                    <p className="bg-gray-800 p-2 rounded mt-1">Create a script that scrapes the titles of the top 5 posts from the Python subreddit.</p>
                    
                    <p className="text-gray-300 font-semibold mt-3">Python:</p>
                    <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                      <code>
{`import requests
import json

# Set up the request headers
headers = {'User-Agent': 'Mozilla/5.0'}

# Make a request to the Reddit API
response = requests.get('https://www.reddit.com/r/Python/top.json?limit=5', headers=headers)

# Parse the JSON response
data = response.json()

# Extract and print the titles of the top 5 posts
for i, post in enumerate(data['data']['children'], 1):
    title = post['data']['title']
    print(f"{i}. {title}")`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'faq' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-blue-400">Frequently Asked Questions</h2>
                
                <div>
                  <h3 className="text-lg font-semibold">What programming languages does SyntaxSucks support?</h3>
                  <p className="mt-1">Currently, SyntaxSucks only supports Python. We plan to add support for other programming languages in the future.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">How accurate is the code generation?</h3>
                  <p className="mt-1">
                    The accuracy depends on the clarity and specificity of your instructions. While our AI is powerful, 
                    it may not always generate perfect code on the first try, especially for complex tasks. You can always 
                    edit the generated code or refine your instructions for better results.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Can I use the generated code in my projects?</h3>
                  <p className="mt-1">
                    Yes! The code generated by SyntaxSucks is yours to use as you wish. However, we recommend reviewing 
                    and testing the code before using it in production environments.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Is my data secure?</h3>
                  <p className="mt-1">
                    We take data privacy seriously. Your instructions and generated code are not stored permanently 
                    unless you explicitly save them to your history. We do not use your data for any purpose other than 
                    providing the service.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">How can I provide feedback or report issues?</h3>
                  <p className="mt-1">
                    We welcome your feedback! Please contact us at feedback@syntaxsucks.com with any suggestions, 
                    feature requests, or bug reports.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documentation;