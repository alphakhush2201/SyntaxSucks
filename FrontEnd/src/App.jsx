import { useState, useEffect } from 'react';
import { Code2, Play, Terminal, Loader2, Save, Copy, Trash2, History, BookOpen } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Toaster, toast } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import Documentation from './components/Documentation';
import About from './components/About';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

function App() {
  const [englishInput, setEnglishInput] = useState('');
  const [pythonOutput, setPythonOutput] = useState('# Your Python code will appear here');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [history, setHistory] = useState([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/history');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      const transformedHistory = data.map(item => ({
        input: item.instructions,
        output: item.python_code,
        timestamp: item.created_at
      }));
      setHistory(transformedHistory);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
    }
  };
  const [showHistory, setShowHistory] = useState(false);

  const handleConvert = async () => {
    if (!englishInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructions: englishInput }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const generatedCode = data.python_code;
      
      setPythonOutput(generatedCode);
      setHistory(prev => [...prev, {
        input: englishInput,
        output: generatedCode,
        timestamp: new Date().toISOString()
      }]);
      toast.success('Code generated successfully!');
    } catch (error) {
      console.error('Conversion failed:', error);
      toast.error('Failed to generate code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!pythonOutput.trim()) return;
    
    setIsLoading(true);
    setActiveTab('output');
    try {
      const response = await fetch('http://127.0.0.1:8000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ python_code: pythonOutput }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setOutput(data.output);
      toast.success('Code executed successfully!');
    } catch (error) {
      console.error('Execution failed:', error);
      setOutput(`Error: ${error.message}`);
      toast.error('Failed to execute code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const handleClear = () => {
    setEnglishInput('');
    setPythonOutput('# Your Python code will appear here');
    setOutput('');
    toast('Cleared all content', { icon: '🗑️' });
  };

  const handleSave = () => {
    const element = document.createElement('a');
    const file = new Blob([pythonOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'generated_code.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Code saved to file!');
  };

  const loadFromHistory = (item) => {
    setEnglishInput(item.input);
    setPythonOutput(item.output);
    setShowHistory(false);
    toast('Loaded from history', { icon: '📜' });
  };

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  // Event listener for opening SignUp from SignIn
  useEffect(() => {
    const handleOpenSignUp = () => {
      setShowSignUp(true);
    };
    
    window.addEventListener('openSignUp', handleOpenSignUp);
    
    return () => {
      window.removeEventListener('openSignUp', handleOpenSignUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {showLoadingScreen ? (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      ) : (
        <>
          <Toaster position="top-right" />
          
          <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm fixed top-0 w-full z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/images/logo.svg" alt="SyntaxSucks Logo" className="w-10 h-10" />
              <h1 className="text-xl font-bold">SyntaxSucks</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (!showHistory) {
                    fetchHistory();
                  }
                  setShowHistory(!showHistory);
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => setShowDocumentation(true)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Documentation</span>
              </button>
              <button 
                onClick={() => setShowSignIn(true)}
                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">English Code</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(englishInput)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy input"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleConvert}
                  disabled={isLoading || !englishInput.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Code2 className="w-4 h-4" />
                  )}
                  <span>Convert</span>
                </button>
              </div>
            </div>
            <textarea
              value={englishInput}
              onChange={(e) => setEnglishInput(e.target.value)}
              className="w-full h-[calc(100vh-300px)] bg-gray-800 rounded-lg p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your instructions in English..."
            />
          </div>

          {/* Python Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold">Python Code</h2>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'code'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Code</span>
                </button>
                <button
                  onClick={() => setActiveTab('output')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'output'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Output</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Save to file"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy(pythonOutput)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExecute}
                  disabled={isLoading || !pythonOutput.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>Run</span>
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-300px)] bg-gray-800 rounded-lg overflow-hidden">
              {activeTab === 'code' ? (
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={pythonOutput}
                  onChange={setPythonOutput}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    readOnly: false,
                    wordWrap: 'on',
                  }}
                />
              ) : (
                <pre className="p-4 font-mono text-sm h-full overflow-auto">
                  {output || 'No output yet. Run your code to see results.'}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold">History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-gray-400">No history yet</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => loadFromHistory(item)}
                    >
                      <p className="text-sm text-gray-300 mb-2">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm line-clamp-2">{item.input}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documentation Panel */}
        {showDocumentation && (
          <Documentation onClose={() => setShowDocumentation(false)} />
        )}

        {/* About Panel */}
        {showAbout && (
          <About onClose={() => setShowAbout(false)} />
        )}

        {/* Sign In Panel */}
        {showSignIn && (
          <SignIn onClose={() => {
            setShowSignIn(false);
          }} />
        )}
        
        {/* Sign Up Panel */}
        {showSignUp && (
          <SignUp onClose={() => setShowSignUp(false)} />
        )}
      </main>

      <footer className="border-t border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center">
              <img src="/images/logo.svg" alt="SyntaxSucks Logo" className="w-8 h-8 mr-2" />
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} SyntaxSucks. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAbout(true)} 
                className="text-gray-400 text-sm hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
              >
                About SyntaxSucks
              </button>
            </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}

export default App;