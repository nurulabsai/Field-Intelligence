import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/index';
import { useUIStore } from './store/index';
import LoadingScreen from './screens/LoadingScreen';
import OfflineBanner from './components/OfflineBanner';
import NuruSideNav from './components/NuruSideNav';
import NuruBottomNav from './components/NuruBottomNav';
import MobileNavDrawer from './components/MobileNavDrawer';
import ToastProvider from './components/ToastProvider';
import LoadingSkeleton from './components/LoadingSkeleton';
import {
  WelcomeWrapper,
  LoginWrapper,
  SignUpWrapper,
  DashboardWrapper,
  AuditListWrapper,
  AuditWizardWrapper,
  BusinessWizardWrapper,
  CalendarWrapper,
  SplashRedirect,
  SettingsPlaceholder,
} from './containers';

// Route-only lazy screens (no container wrapper)
const CameraScanner = lazy(() => import('./screens/audit/CameraScanner'));
const TypeSelectionScreen = lazy(() => import('./screens/audit/TypeSelectionScreen'));
const AuditErrorState = lazy(() => import('./screens/audit/AuditErrorState'));

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
  const navigate = useNavigate();
  const location = useLocation();
  const sideNavOpen = useUIStore((s) => s.sideNavOpen);
  const setSideNavOpen = useUIStore((s) => s.setSideNavOpen);

  const handleNavigate = (path: string) => {
    const leavingAudit = location.pathname.startsWith('/audit') && !path.startsWith('/audit');
    const hasUnsavedAudit = typeof window !== 'undefined' && sessionStorage.getItem('nuru_audit_dirty') === 'true';
    if (leavingAudit && hasUnsavedAudit) {
      const ok = window.confirm('You have unsaved audit changes. Leave this screen?');
      if (!ok) return;
    }
    setSideNavOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    const leavingAudit = location.pathname.startsWith('/audit');
    const hasUnsavedAudit = typeof window !== 'undefined' && sessionStorage.getItem('nuru_audit_dirty') === 'true';
    if (leavingAudit && hasUnsavedAudit) {
      const ok = window.confirm('You have unsaved audit changes. Sign out anyway?');
      if (!ok) return;
    }
    setSideNavOpen(false);
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="flex min-h-screen nuru-screen">
      <MobileNavDrawer
        open={sideNavOpen}
        onClose={() => setSideNavOpen(false)}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={{ name: user?.fullName ?? 'User', role: user?.role ?? 'Agent' }}
        onLogout={handleLogout}
      />

      {/* Desktop Sidebar */}
      <NuruSideNav
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={{ name: user?.fullName ?? 'User', role: user?.role ?? 'Agent' }}
        onLogout={handleLogout}
      />

      {/* Main Content — offset by sidebar width on desktop */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pb-[100px] md:pb-0 md:ml-[260px]">
        <OfflineBanner />
        <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0">
          <div className="w-full max-w-screen-2xl mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav — hidden mid-audit to avoid FAB/Next-button collisions */}
      {!location.pathname.startsWith('/audit/wizard') && (
        <NuruBottomNav
          currentPath={location.pathname}
          onNavigate={handleNavigate}
          onFabPress={() => handleNavigate('/audit/new')}
        />
      )}
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
            path="/auth/welcome"
            element={
              <PublicOnly>
                <WelcomeWrapper />
              </PublicOnly>
            }
          />
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
                  <TypeSelectionScreen />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/audit/wizard/farm"
            element={
              <RequireAuth>
                <AppShell>
                  <AuditWizardWrapper />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/audit/wizard/business"
            element={
              <RequireAuth>
                <AppShell>
                  <BusinessWizardWrapper />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/audit/error"
            element={
              <RequireAuth>
                <AppShell>
                  <AuditErrorState />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/audit/:id"
            element={
              <RequireAuth>
                <AppShell>
                  <AuditWizardWrapper />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/schedule"
            element={
              <RequireAuth>
                <AppShell>
                  <CalendarWrapper />
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

          {/* Fullscreen Camera Route (No AppShell Navigation) */}
          <Route
            path="/scanner"
            element={
              <RequireAuth>
                <CameraScanner />
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

export default App;
