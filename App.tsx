import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { SignInScreen } from './components/SignInScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { OfflineBanner } from './components/OfflineBanner';
import { AppRoutes } from './routes';
import { getAllAudits, saveAuditLocally } from './services/storageService';
import { processSyncQueue } from './services/syncService';
import { referenceDataService } from './services/referenceDataService';
import type { AuditRecord } from './types';
import type { Language } from './services/i18n';

// ─── Toast Notification System ───────────────────────────────────────────────
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const ToastContext = React.createContext<{
  addToast: (message: string, type?: Toast['type']) => void;
}>({ addToast: () => {} });

const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  if (!toasts.length) return null;
  const colors: Record<Toast['type'], string> = {
    success: '#22C55E',
    error: '#EF4444',
    info: '#3B82F6',
    warning: '#F59E0B',
  };
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
        width: 'calc(100% - 32px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          style={{
            background: '#1F2937',
            color: 'white',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderLeft: `4px solid ${colors[t.type]}`,
            pointerEvents: 'all',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 14, fontFamily: "'Manrope', sans-serif", flex: 1 }}>
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0F0F0F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2
            style={{
              color: 'white',
              fontFamily: "'Sora', sans-serif",
              marginBottom: 8,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: '#6B7280',
              fontSize: 14,
              marginBottom: 24,
              maxWidth: 300,
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#F0513E',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── User type ────────────────────────────────────────────────────────────────
interface User {
  name: string;
  role: string;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'welcome' | 'signin' | 'signup'>('welcome');
  const [online, setOnline] = useState(navigator.onLine);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [auditsLoaded, setAuditsLoaded] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [lang, setLangState] = useState<Language>('en');
  const [isTraining, setIsTraining] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const syncInFlight = useRef(false);

  // ── Toast helpers ──
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Load audits ──
  const loadAudits = useCallback(async () => {
    try {
      const list = await getAllAudits();
      setAudits(list);
    } catch (e) {
      console.error('Error loading audits:', e);
    } finally {
      setAuditsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  // ── Restore user session + lang preference ──
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('audit_pro_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setShowSplash(false);
      }
      const savedLang = localStorage.getItem('audit_pro_lang') as Language | null;
      if (savedLang === 'sw' || savedLang === 'en') setLangState(savedLang);
    } catch (e) {
      console.error('Error loading session:', e);
    }
  }, []);

  // ── Online / offline event listeners ──
  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      if (syncInFlight.current) return;
      syncInFlight.current = true;
      try {
        await loadAudits();
        referenceDataService.cacheLocations().catch(() => {});
        const { synced, failed } = await processSyncQueue(msg =>
          console.log('[Sync]', msg)
        );
        if (synced > 0) addToast(`✅ ${synced} audit(s) synced successfully`, 'success');
        if (failed > 0) addToast(`⚠️ ${failed} audit(s) failed to sync`, 'warning');
      } catch (e) {
        console.warn('[Sync error]', e);
      } finally {
        syncInFlight.current = false;
        await loadAudits();
      }
    };

    const handleOffline = () => {
      setOnline(false);
      addToast('📴 You are offline. All data saves locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadAudits, addToast]);

  // ── Service Worker registration + background sync listener ──
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(reg => {
          console.log('[SW] Registered, scope:', reg.scope);
        })
        .catch(err => console.warn('[SW] Registration failed:', err));

      // Listen for background sync trigger from SW
      const handleSWMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'BACKGROUND_SYNC' && !syncInFlight.current) {
          syncInFlight.current = true;
          try {
            const { synced, failed } = await processSyncQueue();
            if (synced > 0) {
              addToast(`✅ Background sync: ${synced} audit(s) uploaded`, 'success');
              await loadAudits();
            }
            if (failed > 0) addToast(`⚠️ ${failed} audit(s) still pending`, 'warning');
          } catch (_) {/* ignore */} finally {
            syncInFlight.current = false;
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    }
  }, [loadAudits, addToast]);

  // ── Screens ──
  if (showSplash && !user) {
    return (
      <SplashScreen
        onComplete={() => setShowSplash(false)}
      />
    );
  }

  if (!user) {
    if (authView === 'welcome') {
      return (
        <WelcomeScreen 
          onGetStarted={() => setAuthView('signup')} 
          onSignIn={() => setAuthView('signin')} 
        />
      );
    }
    
    if (authView === 'signup') {
      return (
        <SignUpScreen 
          onSignUp={(data) => {
            const newUser = { name: data.name, role: 'Auditor' };
            localStorage.setItem('audit_pro_user', JSON.stringify(newUser));
            setUser(newUser);
          }} 
          onSignIn={() => setAuthView('signin')} 
        />
      );
    }

    return (
      <SignInScreen
        onSignIn={(username, role) => {
          const newUser = { name: username, role };
          localStorage.setItem('audit_pro_user', JSON.stringify(newUser));
          setUser(newUser);
        }}
        onSignUp={() => setAuthView('signup')}
        onForgotPassword={() => alert('Contact admin to reset password')}
        onBack={() => setAuthView('welcome')}
      />
    );
  }

  const handleSaveAudit = async (audit: AuditRecord) => {
    try {
      const toSave = { ...audit, status: audit.status || 'pending' };
      await saveAuditLocally(toSave);
      setAudits(prev => {
        const filtered = prev.filter(a => a.id !== audit.id);
        return [...filtered, toSave];
      });
      if (toSave.status === 'draft') {
        addToast('💾 Draft saved locally', 'info');
      } else {
        addToast('✅ Audit saved. Will sync when connected.', 'success');
        // Attempt immediate sync if online
        if (navigator.onLine && !syncInFlight.current) {
          syncInFlight.current = true;
          processSyncQueue()
            .then(({ synced }) => {
              if (synced > 0) loadAudits();
            })
            .catch(() => {})
            .finally(() => { syncInFlight.current = false; });
        }
      }
    } catch (e) {
      addToast('❌ Failed to save audit. Please try again.', 'error');
      throw e;
    }
  };

  const handleSetLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('audit_pro_lang', newLang);
  };

  const sharedProps = {
    lang,
    setLang: handleSetLang,
    isTraining,
    setIsTraining,
    isHighContrast,
    setIsHighContrast,
    onRefresh: loadAudits,
    onLogout: () => {
      localStorage.removeItem('audit_pro_user');
      setUser(null);
      setAudits([]);
    },
    onOpenStats: () => {},
    addToast,
  };

  const unsyncedCount = audits.filter(a => a.status !== 'synced').length;

  return (
    <ErrorBoundary>
      <ToastContext.Provider value={{ addToast }}>
        <div className="min-h-screen flex flex-col font-sans bg-white">
          {!online && <OfflineBanner pendingCount={unsyncedCount} />}
          <AppRoutes
            audits={audits}
            user={user}
            sharedProps={sharedProps}
            onSaveAudit={handleSaveAudit}
            capturedFile={capturedFile}
            setCapturedFile={setCapturedFile}
            online={online}
          />
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
      </ToastContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
