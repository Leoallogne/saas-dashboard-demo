import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-slate-900/95 border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
        };
      case 'warning':
        return {
          bg: 'bg-slate-900/95 border-amber-500/30 text-amber-400',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 border-brand-500/30 text-brand-400',
          icon: <Info className="w-5 h-5 text-brand-400" />
        };
    }
  };

  const style = getToastStyle(toast.type);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 ${style.bg} max-w-sm w-80 animate-slide-up`}>
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-100 tracking-tight">{toast.title}</h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">{toast.message}</p>
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-0.5 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}
