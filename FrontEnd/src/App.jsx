import { useState, useEffect } from 'react';
import { Code2, Play, Terminal, Loader2, Save, Copy, Trash2, History, BookOpen, LogIn, LogOut, UserPlus, X, Info } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Toaster, toast } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import Documentation from './components/Documentation';
import About from './components/About';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

// Get API URL from environment variables
const API_URL = "https://syntaxsucks.onrender.com";

// Supported languages
const SUPPORTED_LANGUAGES = {
  python: {
    name: 'Python',
    extension: 'py',
    icon: '🐍'
  },
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    icon: '📜'
  },
  java: {
    name: 'Java',
    extension: 'java',
    icon: '☕'
  },
  cpp: {
    name: 'C++',
    extension: 'cpp',
    icon: '⚡'
  },
  ruby: {
    name: 'Ruby',
    extension: 'rb',
    icon: '💎'
  }
};

export default function App() {
  const { user, isAuthenticated, signOut, isConfigured } = useAuth();
  const [englishInput, setEnglishInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('# Your code will appear here');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [history, setHistory] = useState([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const fetchHistory = async () => {
    // Only fetch history if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please sign in to view history');
      setShowSignIn(true);
      return;
    }
    
    try {
      // Get the session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history. Please try again.');
    }
  };
  
  const handleConvert = async () => {
    if (!englishInput.trim()) {
      toast.error('Please enter some instructions first');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get authentication token if user is authenticated
      let headers = {
        'Content-Type': 'application/json',
      };
      
      if (isAuthenticated) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
      
      const response = await fetch(`${API_URL}/convert`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          instructions: englishInput,
          language: selectedLanguage
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.code) {
        throw new Error('No code received from the server');
      }
      
      setCodeOutput(data.code);
      setHistory(prev => [...prev, {
        input: englishInput,
        output: data.code,
        language: selectedLanguage,
        timestamp: new Date().toISOString()
      }]);
      toast.success(`${SUPPORTED_LANGUAGES[selectedLanguage].name} code generated successfully!`);
    } catch (error) {
      console.error('Conversion failed:', error);
      toast.error(error.message || 'Failed to generate code. Please try again.');
      setCodeOutput(`# Error: ${error.message || 'Failed to generate code'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!codeOutput.trim()) {
      toast.error('No code to execute');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get authentication token if user is authenticated
      let headers = {
        'Content-Type': 'application/json',
      };
      
      if (isAuthenticated) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
      
      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          code: codeOutput,
          language: selectedLanguage
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setOutput(`Error: ${data.error}`);
        toast.error('Code execution failed');
      } else {
        setOutput(data.output || 'Code executed successfully (no output)');
        toast.success('Code executed successfully!');
      }
      
      setActiveTab('output');
    } catch (error) {
      console.error('Execution failed:', error);
      setOutput(`Error: ${error.message || 'Failed to execute code'}`);
      toast.error(error.message || 'Failed to execute code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClear = () => {
    setEnglishInput('');
    setCodeOutput(`# Your ${SUPPORTED_LANGUAGES[selectedLanguage].name} code will appear here`);
    setOutput('');
    setActiveTab('code');
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save your code');
      setShowSignIn(true);
      return;
    }
    
    // Save to history
    setHistory(prev => [...prev, {
      input: englishInput,
      output: codeOutput,
      language: selectedLanguage,
      timestamp: new Date().toISOString()
    }]);
    
    toast.success('Code saved to history!');
  };

  const loadFromHistory = (item) => {
    setEnglishInput(item.instructions);
    setCodeOutput(item.code);
    setSelectedLanguage(item.language);
    setOutput(item.output || '');
    setActiveTab('code');
  };

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  const handleOpenSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleOpenSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCodeOutput(`# Your ${SUPPORTED_LANGUAGES[language].name} code will appear here`);
    setIsLanguageDropdownOpen(false);
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

  // Add click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageDropdownOpen && !event.target.closest('.language-dropdown')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageDropdownOpen]);

  // Add a warning banner for missing Supabase configuration
  const renderSupabaseWarning = () => {
    if (!isConfigured) {
      return (
        <div className="bg-yellow-500 text-black p-4 text-center">
          <p className="font-semibold">Warning: Authentication is disabled</p>
          <p className="text-sm">Please configure Supabase in your .env file to enable authentication features.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A]">
      <Toaster position="top-right" />
      
      {showLoadingScreen ? (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      ) : (
        <>
          {renderSupabaseWarning()}
          
          <header className="border-b border-slate-700/50 bg-[#0F172A] p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <img src="/images/logo.svg" alt="SyntaxSucks" className="h-8 w-8" />
                <span className="text-slate-200 font-semibold text-xl">SyntaxSucks</span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please sign in to view history');
                      setShowSignIn(true);
                      return;
                    }
                    fetchHistory();
                    setShowHistory(true);
                  }}
                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-2"
                >
                  <History className="h-5 w-5" />
                  <span>History</span>
                </button>
                <button 
                  onClick={() => setShowDocumentation(true)}
                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Documentation</span>
                </button>
                <button 
                  onClick={() => setShowAbout(true)}
                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-2"
                >
                  <Info className="h-5 w-5" />
                  <span>About</span>
                </button>
                {isAuthenticated ? (
                  <button 
                    onClick={signOut}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowSignIn(true)}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </header>
          
          <main className="flex-1 container mx-auto p-4 flex flex-col overflow-hidden">
            <div className="flex gap-4 h-[calc(100vh-12rem)]">
              {/* Left Column - English Code */}
              <div className="flex-1 bg-[#1E293B] border border-slate-700/50 rounded-lg p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5 text-slate-200" />
                    <h2 className="text-slate-200 font-semibold">English Code</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-slate-400 hover:text-slate-200 p-2">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-200 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleConvert}
                      disabled={isLoading}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1 rounded-lg flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Code2 className="h-4 w-4" />
                      )}
                      <span>Convert</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={englishInput}
                  onChange={(e) => setEnglishInput(e.target.value)}
                  className="flex-1 w-full bg-[#0F172A] text-slate-200 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded-lg"
                  placeholder="Enter your instructions in English..."
                />
              </div>
              
              {/* Right Column - Generated Code */}
              <div className="flex-1 bg-[#1E293B] border border-slate-700/50 rounded-lg p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-5 w-5 text-slate-200" />
                    <h2 className="text-slate-200 font-semibold">{SUPPORTED_LANGUAGES[selectedLanguage].name} Code</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Language Selection Dropdown */}
                    <div className="relative language-dropdown">
                      <button
                        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                        className="px-3 py-1 bg-[#0F172A] border border-slate-700/50 rounded-lg hover:bg-[#1E293B] transition-colors flex items-center space-x-2"
                      >
                        <span>{SUPPORTED_LANGUAGES[selectedLanguage].icon}</span>
                        <span className="text-slate-200">{SUPPORTED_LANGUAGES[selectedLanguage].name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isLanguageDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-slate-700/50 rounded-lg shadow-lg py-1 z-10">
                          {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                            <button
                              key={key}
                              onClick={() => handleLanguageChange(key)}
                              className={`w-full px-4 py-2 text-left hover:bg-[#1E293B] flex items-center space-x-2 ${
                                selectedLanguage === key ? 'bg-[#3B82F6]/20' : ''
                              }`}
                            >
                              <span>{lang.icon}</span>
                              <span className="text-slate-200">{lang.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="text-slate-400 hover:text-slate-200 p-2">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-200 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleExecute}
                      disabled={isLoading}
                      className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-3 py-1 rounded-lg flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span>Run</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage={selectedLanguage}
                    value={codeOutput}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Output Section */}
            <div className="mt-4 bg-[#1E293B] border border-slate-700/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-slate-200" />
                  <h2 className="text-slate-200 font-semibold">Output</h2>
                </div>
                <button 
                  className="text-slate-400 hover:text-slate-200 p-2"
                  onClick={() => handleCopy(output)}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <pre className="bg-[#0F172A] border border-slate-700/50 p-4 rounded-lg overflow-auto h-32 text-slate-200 font-mono">
                {output || 'Program output will appear here...'}
              </pre>
            </div>
          </main>
          
          {/* Modals */}
          {showDocumentation && (
            <Documentation onClose={() => setShowDocumentation(false)} />
          )}
          
          {showAbout && (
            <About onClose={() => setShowAbout(false)} />
          )}
          
          {showSignIn && (
            <SignIn 
              onClose={() => setShowSignIn(false)} 
              onSignUpClick={handleOpenSignUp}
            />
          )}
          
          {showSignUp && (
            <SignUp 
              onClose={() => setShowSignUp(false)} 
              onSignInClick={handleOpenSignIn}
            />
          )}
          
          {/* History Modal */}
          {showHistory && history.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">History</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setHistory([])}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                            {new Date(item.timestamp || item.created_at).toLocaleString()}
                          </span>
                          <span className="text-xs bg-blue-500 px-2 py-1 rounded">
                            {SUPPORTED_LANGUAGES[item.language || 'python']?.name || 'Python'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                        {item.instructions || item.input}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <footer className="border-t border-gray-800 py-4">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} SyntaxSucks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}