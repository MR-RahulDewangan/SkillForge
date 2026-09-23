import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
    <Loader2 className="text-indigo-600 animate-spin" size={48} />
    <p className="text-slate-500 font-medium animate-pulse">{message}</p>
  </div>
);

const EmptyState = ({ title, description, icon: Icon, actionText, onAction }) => (
  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 px-6">
    <div className="mx-auto w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
      {Icon ? <Icon size={40} /> : null}
    </div>
    <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-md mx-auto mb-8">{description}</p>
    {actionText && (
      <button
        onClick={onAction}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
      >
        {actionText}
      </button>
    )}
  </div>
);

export { LoadingScreen, EmptyState };
