import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/index';
import ToastProvider from './components/ToastProvider';

// Eager-loaded (first paint)
import StitchLoadingScreen from './pages/LoadingScreen';

// Lazy-loaded screens
const WelcomeScreen = lazy(() => import('./pages/WelcomeScreen'));
const SignInScreen = lazy(() => import('./pages/SignInScreen'));
const SignUpScreen = lazy(() => import('./pages/SignUpScreen'));
const DashboardScreen = lazy(() => import('./pages/DashboardScreen'));
const ScheduleScreen = lazy(() => import('./pages/ScheduleScreen'));
const AuditTypeSelectorScreen = lazy(() => import('./pages/AuditTypeSelectorScreen'));
const AuditFormScreen = lazy(() => import('./pages/AuditFormScreen'));
const SyncDashboardScreen = lazy(() => import('./pages/SyncDashboardScreen'));
const CameraScreen = lazy(() => import('./pages/CameraScreen'));

// Keep old screens accessible for backward compatibility
const LegacyAuditWizard = lazy(() => import('./screens/audit/AuditWizard'));
const LegacyAuditList = lazy(() => import('./screens/audit/AuditList'));

// ---------------------------------------------------------------------------
// Auth Guards
// ---------------------------------------------------------------------------

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);

  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Page Loader (suspense fallback)
// ---------------------------------------------------------------------------

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-deep">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined animate-spin text-neon-lime text-[32px]">
          progress_activity
        </span>
        <p className="font-manrope text-xs text-white/40">Loading...</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings (minimal)
// ---------------------------------------------------------------------------

function SettingsScreen() {
  const user = useAuthStore(s => s.user);
  const signOut = useAuthStore(s => s.signOut);

  return (
    <div className="min-h-dvh bg-bg-deep p-6 max-w-[600px] mx-auto">
      <h1 className="font-sora text-2xl font-light text-white mb-6">Settings</h1>

      <div className="glass-card rounded-[24px] p-6 mb-4">
        <div className="mb-4">
          <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1">Name</p>
          <p className="font-manrope text-base text-white">{user?.fullName ?? 'N/A'}</p>
        </div>
        <div className="mb-4">
          <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1">Email</p>
          <p className="font-manrope text-base text-white">{user?.email ?? 'N/A'}</p>
        </div>
        <div>
          <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1">Role</p>
          <p className="font-manrope text-base text-white capitalize">{user?.role ?? 'N/A'}</p>
        </div>
      </div>

      <button
        onClick={async () => {
          await signOut();
          window.location.href = '/signin';
        }}
        className="w-full rounded-full border border-neon-red/20 bg-neon-red/10 py-4 font-manrope text-sm font-bold uppercase tracking-[0.15em] text-neon-red transition-all active:scale-95"
      >
        Sign Out
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const restoreSession = useAuthStore(s => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (showSplash) {
    return <StitchLoadingScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <ToastProvider />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SplashRedirect />} />
          <Route path="/welcome" element={<PublicOnly><WelcomeScreen /></PublicOnly>} />
          <Route path="/signin" element={<PublicOnly><SignInScreen /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><SignUpScreen /></PublicOnly>} />

          {/* Legacy auth routes (redirect) */}
          <Route path="/auth/login" element={<Navigate to="/signin" replace />} />
          <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><ScheduleScreen /></ProtectedRoute>} />
          <Route path="/audit/select" element={<ProtectedRoute><AuditTypeSelectorScreen /></ProtectedRoute>} />
          <Route path="/audit/new/:type" element={<ProtectedRoute><AuditFormScreen /></ProtectedRoute>} />
          <Route path="/sync" element={<ProtectedRoute><SyncDashboardScreen /></ProtectedRoute>} />
          <Route path="/camera" element={<ProtectedRoute><CameraScreen /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />

          {/* Legacy routes */}
          <Route path="/audits" element={<ProtectedRoute><LegacyAuditList audits={[]} /></ProtectedRoute>} />
          <Route path="/audit/new" element={<ProtectedRoute><LegacyAuditWizard /></ProtectedRoute>} />
          <Route path="/audit/:id" element={<ProtectedRoute><LegacyAuditWizard /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

// ---------------------------------------------------------------------------
// Splash redirect
// ---------------------------------------------------------------------------

function SplashRedirect() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);

  if (isLoading) return <PageLoader />;

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />;
}
