import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-te-white flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-20 animate-pulse"></div>
        
        {/* Loading Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo/Title */}
          <div className="mb-8 text-center">
            <div className="text-xs uppercase tracking-wider text-te-black/50 mb-2">TE-01</div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-te-black">
              Tic Tac Toe
            </h1>
          </div>
          
          {/* Loading Animation */}
          <div className="flex space-x-2 mb-8">
            <div className="w-3 h-3 bg-te-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-te-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-te-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-xs uppercase tracking-wider text-te-black/50 animate-pulse">
            Loading Game...
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-te-gray">
        <div 
          className="h-full bg-te-orange"
          style={{
            animation: 'loading-bar 2s ease-out forwards'
          }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingScreen;