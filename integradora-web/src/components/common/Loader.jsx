import React, { useEffect } from 'react';

const Loader = ({ text = 'Cargando...', size = 'md' }) => {
  // Font is loaded in Navbar/App

  // Dot sizes based on loader size
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
      {/* Dot Animation */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div
          className={`${dotSizes[size]} bg-black rounded-full animate-bounce`}
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        ></div>
        <div
          className={`${dotSizes[size]} bg-black rounded-full animate-bounce`}
          style={{ animationDelay: '150ms', animationDuration: '1s' }}
        ></div>
        <div
          className={`${dotSizes[size]} bg-black rounded-full animate-bounce`}
          style={{ animationDelay: '300ms', animationDuration: '1s' }}
        ></div>
        <div
          className={`${dotSizes[size]} bg-black rounded-full animate-bounce`}
          style={{ animationDelay: '450ms', animationDuration: '1s' }}
        ></div>
      </div>

      {/* Text */}
      {text && (
        <p
          className={`${textSizes[size]} font-medium text-black tracking-wide`}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;