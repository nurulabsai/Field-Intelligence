import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/main.css';

// ---------------------------------------------------------------------------
// Service Worker Registration
// ---------------------------------------------------------------------------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        if (import.meta.env.DEV) {
          console.log('[SW] Registered:', reg.scope);
        }
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });

  // Listen for background sync messages from the service worker
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data?.type === 'BACKGROUND_SYNC') {
      const { drainQueue } = await import('./lib/sync-queue');
      drainQueue();
    }
  });
}

// ---------------------------------------------------------------------------
// Supabase Auth State Change Listener
// ---------------------------------------------------------------------------

(async () => {
  const { supabase } = await import('./lib/supabase');
  const { useAuthStore } = await import('./store/index');

  supabase.auth.onAuthStateChange((_event, session) => {
    const store = useAuthStore.getState();
    if (session?.user) {
      const u = session.user;
      store.setUser({
        id: u.id,
        email: u.email ?? '',
        fullName: (u.user_metadata?.full_name as string) ?? '',
        role: (u.user_metadata?.role as string) ?? 'auditor',
      });
      store.setSession({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at ?? 0,
      });
    } else if (_event === 'SIGNED_OUT') {
      store.setUser(null);
      store.setSession(null);
    }
  });
})();

// ---------------------------------------------------------------------------
// App Mount
// ---------------------------------------------------------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
