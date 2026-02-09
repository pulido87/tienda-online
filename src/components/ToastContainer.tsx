import { useStore } from '../store';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-slideInRight
            ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-white' : ''}
            ${toast.type === 'info' ? 'bg-blue-900/90 border-blue-500/50 text-white' : ''}
          `}
        >
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : ''}
            ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
            ${toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
          `}>
            {toast.type === 'success' && <Check size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          
          <p className="text-sm font-medium pr-2">{toast.message}</p>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
