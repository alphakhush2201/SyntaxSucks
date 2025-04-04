import { useState } from 'react';
import { X, Github, Linkedin, Twitter, Mail, Globe } from 'lucide-react';

function About({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F172A] rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/images/logo.svg" alt="SyntaxSucks Logo" className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-slate-200">About SyntaxSucks</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close about page"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-[#3B82F6]">SyntaxSucks</h1>
              <p className="text-xl text-slate-300">
                Breaking down the barriers between natural language and code
              </p>
            </div>

            {/* Creator Profile */}
            <div className="bg-[#1E293B] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white text-4xl font-bold">
                KC
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-200">Khushwant Singh Chouhan</h2>
                <p className="text-slate-300">
                  Creator & Lead Developer
                </p>
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <a href="https://github.com/alphakhush2201" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-200 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/khush0in" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-200 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="mailto:khushwant.ksc.in@gmail.com" className="text-slate-400 hover:text-slate-200 transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="https://portfolio-sandy-kappa-77.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-200 transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* The Story */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#3B82F6]">The Story Behind SyntaxSucks</h2>
              <p className="text-slate-300">
                As a developer, I've always been frustrated by how programming syntax can be a barrier for beginners and even experienced developers. The name "SyntaxSucks" came from countless late-night debugging sessions where a missing semicolon or incorrect indentation caused hours of frustration.
              </p>
              <p className="text-slate-300">
                I created SyntaxSucks with a simple mission: to make programming more accessible by allowing people to express their ideas in plain English and have them automatically converted into functional code. By leveraging the power of AI, SyntaxSucks bridges the gap between human language and machine instructions.
              </p>
            </div>

            {/* Development Journey */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#3B82F6]">Development Journey</h2>
              <div className="space-y-6">
                <div className="bg-[#1E293B] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-200">Inspiration</h3>
                  <p className="mt-2 text-slate-300">
                    The idea for SyntaxSucks came after teaching programming to beginners and witnessing their frustration with syntax errors. I realized that many people have brilliant ideas but struggle to implement them because of programming language barriers.
                  </p>
                </div>
                
                <div className="bg-[#1E293B] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-200">Technology Stack</h3>
                  <p className="mt-2 text-slate-300">
                    SyntaxSucks is built with a React frontend and a Python backend. It uses advanced AI models to translate natural language into Python code, with plans to support more programming languages in the future.
                  </p>
                </div>
                
                <div className="bg-[#1E293B] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-200">Future Vision</h3>
                  <p className="mt-2 text-slate-300">
                    My vision for SyntaxSucks is to continue expanding its capabilities, supporting more programming languages, and making it an indispensable tool for both beginners and professionals. I'm committed to democratizing programming and making it accessible to everyone.
                  </p>
                </div>
              </div>
            </div>

            {/* Get Involved */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#3B82F6]">Get Involved</h2>
              <p className="text-slate-300">
                SyntaxSucks is an evolving project, and I welcome contributions, feedback, and suggestions. If you're interested in contributing or have ideas for improvement, please reach out through any of the social links above or check out the GitHub repository.
              </p>
              <div className="flex justify-center mt-6">
                <a 
                  href="https://github.com/khushwantSinghChauhan/SyntaxSucks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] transition-colors rounded-lg flex items-center space-x-2 text-white"
                >
                  <Github className="w-5 h-5" />
                  <span>View on GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default About;
