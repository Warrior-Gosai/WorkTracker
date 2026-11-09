import React from 'react';
import { Layers, Loader2 } from 'lucide-react';
import { APP_NAME } from '../../constants';

export const LoadingScreen = ({ message = 'Initializing DevWork Tracker...' }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        {/* App Icon */}
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md mb-4">
          <Layers className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          {APP_NAME}
        </h2>
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

