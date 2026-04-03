import React from 'react';
import MaterialIcon from './MaterialIcon';
import { create } from 'zustand';

// --- Toast Store ---
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Convenience helper
export const toast = {
  success: (message: string) =>
    useToastStore.getState().addToast({ type: 'success', message }),
  error: (message: string) =>
    useToastStore.getState().addToast({ type: 'error', message }),
  warning: (message: string) =>
    useToastStore.getState().addToast({ type: 'warning', message }),
  info: (message: string) =>
    useToastStore.getState().addToast({ type: 'info', message }),
};

// --- Toast Item Component ---
const borderColors: Record<string, string> = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({
  toast: t,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, t.duration || 4000);

    return () => clearTimeout(timer);
  }, [t.duration, onDismiss]);

  return (
    <div
      className="bg-[rgba(30,30,30,0.95)] backdrop-blur-[12px] rounded-xl py-3 px-4 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-[420px] w-full font-[Inter,sans-serif] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        borderLeft: `4px solid ${borderColors[t.type]}`,
        transform: isVisible && !isExiting ? 'translateY(0)' : 'translateY(-20px)',
        opacity: isVisible && !isExiting ? 1 : 0,
      }}
    >
      <span className="text-white text-sm font-medium flex-1">
        {t.message}
      </span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onDismiss, 300);
        }}
        className="bg-transparent border-none text-text-tertiary cursor-pointer p-1 flex items-center rounded shrink-0"
      >
        <MaterialIcon name="close" size={14} />
      </button>
    </div>
  );
};

// --- Toast Provider ---
const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none w-full max-w-[440px] px-4">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full">
            <ToastItem toast={t} onDismiss={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastProvider;
