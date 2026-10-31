import React from 'react';

const LoadingSpinner = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-brand-blue/20 border-t-brand-blue animate-spin`}
      />
      {message && <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-navy-950/80 backdrop-blur-sm z-50 fixed inset-0">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{content}</div>;
};

export default LoadingSpinner;
