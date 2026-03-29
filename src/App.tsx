import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/index';
import { useUIStore } from './store/index';
import LoadingScreen from './screens/LoadingScreen';
import OfflineBanner from './components/OfflineBanner';
import NuruSideNav from './components/NuruSideNav';
import NuruBottomNav from './components/NuruBottomNav';
import ToastProvider from './components/ToastProvider';
import LoadingSkeleton from './components/LoadingSkeleton';

// Lazy-loaded screens
const SignUpScreen = lazy(() => import('./screens/auth/SignUpScreen'));
const LoginScreen = lazy(() => import('./screens/auth/LoginScreen'));
const DashboardHome = lazy(() => import('./screens/dashboard/DashboardHome'));
const AuditList = lazy(() => import('./screens/audit/AuditList'));
const AuditWizard = lazy(() => import('./screens/audit/AuditWizard'));
const CalendarScreen = lazy(() => import('./screens/schedule/CalendarScreen'));

// ─── Auth Guard ──────────────────────────────────────────────────────────────
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

// ─── Public Guard (redirect to dashboard if logged in) ──────────────────────
const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

// ─── App Shell (sidebar + bottom nav + content) ────────────────────────────
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const isOnline = useUIStore((s) => s.isOnline);
  const pendingSyncCount = useUIStore((s) => s.pendingSyncCount);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Desktop Sidebar */}
      <NuruSideNav
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={{ name: user?.fullName ?? 'User', role: user?.role ?? 'Agent' }}
        onLogout={async () => {
          await signOut();
          navigate('/auth/login');
        }}
      />

      {/* Main Content — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-h-screen pb-[72px] md:ml-[260px]">
        {!isOnline && <OfflineBanner pendingCount={pendingSyncCount} />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <NuruBottomNav
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

// ─── Suspense Wrapper ───────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-bg-primary p-6 flex flex-col gap-4">
    <LoadingSkeleton variant="text" count={2} />
    <LoadingSkeleton variant="card" count={3} />
  </div>
);

// ─── Main App ───────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (showSplash) {
    return <LoadingScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <ToastProvider />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Splash redirect */}
          <Route path="/" element={<SplashRedirect />} />

          {/* Public auth routes */}
          <Route
            path="/auth/signup"
            element={
              <PublicOnly>
                <SignUpWrapper />
              </PublicOnly>
            }
          />
          <Route
            path="/auth/login"
            element={
              <PublicOnly>
                <LoginWrapper />
              </PublicOnly>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <AppShell>
                  <DashboardWrapper />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/audits"
            element={
              <RequireAuth>
                <AppShell>
                  <AuditListWrapper />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/audit/new"
            element={
              <RequireAuth>
                <AppShell>
                  <AuditWizard />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/audit/:id"
            element={
              <RequireAuth>
                <AppShell>
                  <AuditWizard />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/schedule"
            element={
              <RequireAuth>
                <AppShell>
                  <CalendarScreen />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <AppShell>
                  <SettingsPlaceholder />
                </AppShell>
              </RequireAuth>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

// ─── Auth Screen Wrappers ───────────────────────────────────────────────────
const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  return (
    <LoginScreen
      onLogin={async (data) => {
        await signIn(data.email, data.password);
        navigate('/dashboard');
      }}
      onNavigateToSignUp={() => navigate('/auth/signup')}
      onForgotPassword={() => alert('Contact admin to reset password')}
    />
  );
};

const SignUpWrapper: React.FC = () => {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);

  return (
    <SignUpScreen
      onSignUp={async (data) => {
        await signUp(data.email, data.password, data.full_name);
        navigate('/dashboard');
      }}
      onNavigateToLogin={() => navigate('/auth/login')}
    />
  );
};

// ─── Dashboard Wrapper ──────────────────────────────────────────────────────
const DashboardWrapper: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <DashboardHome
      userName={user?.fullName}
      onAuditClick={(id) => navigate(`/audit/${id}`)}
      onViewAllAudits={() => navigate('/audits')}
    />
  );
};

// ─── Audit Wrappers ─────────────────────────────────────────────────────────
const AuditListWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuditList
      audits={[]}
      onAuditClick={(id) => navigate(`/audit/${id}`)}
      onNewAudit={() => navigate('/audit/new')}
    />
  );
};

// ─── Splash Redirect ────────────────────────────────────────────────────────
const SplashRedirect: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/login" replace />;
};

// ─── Settings Screen (basic) ────────────────────────────────────────────────
const SettingsPlaceholder: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-[600px] mx-auto">
      <h1 className="text-2xl font-bold text-text-primary font-heading mb-6">
        Settings
      </h1>

      <div className="bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)] p-6 mb-4">
        <div className="mb-4">
          <div className="text-xs text-text-tertiary mb-1">Name</div>
          <div className="text-base text-text-primary">{user?.fullName || 'N/A'}</div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-text-tertiary mb-1">Email</div>
          <div className="text-base text-text-primary">{user?.email || 'N/A'}</div>
        </div>
        <div>
          <div className="text-xs text-text-tertiary mb-1">Role</div>
          <div className="text-base text-text-primary capitalize">{user?.role || 'N/A'}</div>
        </div>
      </div>

      <button
        onClick={async () => {
          await signOut();
          navigate('/auth/login');
        }}
        className="w-full py-3.5 px-6 bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)] rounded-xl text-base font-semibold cursor-pointer font-base"
      >
        Sign Out
      </button>
    </div>
  );
};

export default App;
