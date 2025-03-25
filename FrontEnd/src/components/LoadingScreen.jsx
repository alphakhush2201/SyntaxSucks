import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const minLoadTime = 5000;
    
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min(100, Math.floor((elapsedTime / minLoadTime) * 100));
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        onLoadingComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 z-50">
      <div className="flex flex-col items-center justify-center space-y-8">
        <img src="/images/logo.svg" alt="SyntaxSucks Logo" className="w-40 h-40 animate-pulse" />
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-300 text-sm">Loading SyntaxSucks...</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;