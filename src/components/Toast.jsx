import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon } from './icons';

const ToastContext = createContext(null);
let _nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++_nextId;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    success: {
      bar: 'border-l-4 border-emerald-500',
      icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    },
    error: {
      bar: 'border-l-4 border-red-500',
      icon: <XCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
    },
  };

  const { bar, icon } = config[toast.type] ?? config.success;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 bg-white ${bar} px-4 py-3 rounded-lg shadow-lg min-w-72 max-w-sm animate-toast-in`}
      role="alert"
    >
      {icon}
      <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
