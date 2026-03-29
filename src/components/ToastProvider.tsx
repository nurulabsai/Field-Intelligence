import React from 'react';
import { X } from 'lucide-react';
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
      style={{
        backgroundColor: 'rgba(30,30,30,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '12px',
        borderLeft: `4px solid ${borderColors[t.type]}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        transform: isVisible && !isExiting ? 'translateY(0)' : 'translateY(-20px)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '420px',
        width: '100%',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span
        style={{
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 500,
          flex: 1,
        }}
      >
        {t.message}
      </span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onDismiss, 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#6B7280',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      >
        <X size={14} />
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
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center',
          pointerEvents: 'none',
          width: '100%',
          maxWidth: '440px',
          padding: '0 16px',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto', width: '100%' }}>
            <ToastItem toast={t} onDismiss={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastProvider;
