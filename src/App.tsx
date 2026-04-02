import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from './store/index';
import { useUIStore } from './store/index';
import { useAuditStore } from './store/index';
import { schedule, dashboard } from './lib/supabase';
import LoadingScreen from './screens/LoadingScreen';
import OfflineBanner from './components/OfflineBanner';
import NuruSideNav from './components/NuruSideNav';
import NuruBottomNav from './components/NuruBottomNav';
import ToastProvider from './components/ToastProvider';
import LoadingSkeleton from './components/LoadingSkeleton';

// Lazy-loaded screens
const SignUpScreen = lazy(() => import('./screens/auth/SignUpScreen'));
const LoginScreen = lazy(() => import('./screens/auth/LoginScreen'));
const WelcomeScreen = lazy(() => import('./screens/auth/WelcomeScreen'));
const DashboardHome = lazy(() => import('./screens/dashboard/DashboardHome'));
const AuditList = lazy(() => import('./screens/audit/AuditList'));
const AuditWizard = lazy(() => import('./screens/audit/AuditWizard'));
const CalendarScreen = lazy(() => import('./screens/schedule/CalendarScreen'));
const CameraScanner = lazy(() => import('./screens/audit/CameraScanner'));
const TypeSelectionScreen = lazy(() => import('./screens/audit/TypeSelectionScreen'));
const BusinessWizard = lazy(() => import('./screens/audit/BusinessWizard'));

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
    const leavingAudit = location.pathname.startsWith('/audit') && !path.startsWith('/audit');
    const hasUnsavedAudit = typeof window !== 'undefined' && sessionStorage.getItem('nuru_audit_dirty') === 'true';
    if (leavingAudit && hasUnsavedAudit) {
      const ok = window.confirm('You have unsaved audit changes. Leave this screen?');
      if (!ok) return;
    }
    navigate(path);
  };

  return (
    <div className="flex min-h-screen nuru-screen">
      {/* Desktop Sidebar */}
      <NuruSideNav
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={{ name: user?.fullName ?? 'User', role: user?.role ?? 'Agent' }}
        onLogout={async () => {
          const leavingAudit = location.pathname.startsWith('/audit');
          const hasUnsavedAudit = typeof window !== 'undefined' && sessionStorage.getItem('nuru_audit_dirty') === 'true';
          if (leavingAudit && hasUnsavedAudit) {
            const ok = window.confirm('You have unsaved audit changes. Sign out anyway?');
            if (!ok) return;
          }
          await signOut();
          navigate('/auth/login');
        }}
      />

      {/* Main Content — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-h-screen pb-[100px] md:pb-0 md:ml-[260px]">
        {!isOnline && <OfflineBanner pendingCount={pendingSyncCount} />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <NuruBottomNav
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        onFabPress={() => handleNavigate('/audit/new')}
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
                  <BusinessWizard />
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

// ─── Auth Screen Wrappers ───────────────────────────────────────────────────
const WelcomeWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <WelcomeScreen
      onNavigateToLogin={() => navigate('/auth/login')}
      onNavigateToSignUp={() => navigate('/auth/signup')}
    />
  );
};

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
  const pendingSync = useUIStore((s) => s.pendingSyncCount);
  const addToast = useUIStore((s) => s.addToast);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ totalAudits: number; submittedToday: number; pendingSync: number; verified: number }>();
  const [audits, setAudits] = useState<Array<{ id: string; farmName: string; auditType: string; date: string; status: 'draft' | 'submitted' | 'verified' | 'synced' | 'failed' }> | undefined>(undefined);
  const [prices, setPrices] = useState<Array<{ id: string; crop: string; region: string; pricePerKg: number; change: number }> | undefined>(undefined);
  const [stressAlert, setStressAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    Promise.all([
      dashboard.getStats(user.id),
      dashboard.getRecentAudits(user.id, 10),
      dashboard.getCropPrices(undefined, 12),
    ])
      .then(([s, recent, market]) => {
        const submittedToday = recent.filter((a) => {
          const date = new Date(a.updated_at || a.created_at).toDateString();
          return date === new Date().toDateString() && a.status === 'submitted';
        }).length;
        const verified = recent.filter((a) => a.status === 'approved').length;
        setStats({
          totalAudits: s.totalAudits,
          submittedToday,
          pendingSync,
          verified,
        });

        const statusMap: Record<string, 'draft' | 'submitted' | 'verified' | 'synced' | 'failed'> = {
          draft: 'draft',
          in_progress: 'draft',
          submitted: 'submitted',
          approved: 'verified',
          rejected: 'failed',
        };

        setAudits(recent.map((a) => ({
          id: a.id,
          farmName: `Farm ${a.farm_id.slice(0, 8)}`,
          auditType: 'Farm Audit',
          date: new Date(a.updated_at || a.created_at).toLocaleDateString('en-TZ', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: statusMap[a.status] ?? 'draft',
        })));

        setPrices(market.slice(0, 7).map((m) => ({
          id: m.id,
          crop: `Crop ${m.crop_id.slice(0, 6)}`,
          region: m.region_id ? `Region ${m.region_id.slice(0, 5)}` : 'Region N/A',
          pricePerKg: m.price_per_kg,
          change: 0,
        })));
      })
      .catch(() => {
        setStressAlert('Live dashboard data is currently unavailable. Showing fallback content.');
        setAudits(undefined);
        setPrices(undefined);
        setStats(undefined);
        addToast({ type: 'warning', message: 'Failed to load live dashboard data.' });
      })
      .finally(() => setIsLoading(false));
  }, [user?.id, addToast]);

  useEffect(() => {
    setStats((prev) => (prev ? { ...prev, pendingSync } : prev));
  }, [pendingSync]);

  return (
    <DashboardHome
      userName={user?.fullName}
      isLoading={isLoading}
      stats={stats}
      audits={audits}
      prices={prices}
      stressAlert={stressAlert}
      onAuditClick={(id) => navigate(`/audit/${id}`)}
      onViewAllAudits={() => navigate('/audits')}
      onStartNewAudit={() => navigate('/audit/new')}
    />
  );
};

// ─── Audit Wrappers ─────────────────────────────────────────────────────────
const AuditListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const audits = useAuditStore((s) => s.audits);
  const loadAudits = useAuditStore((s) => s.loadAudits);
  const isLoading = useAuditStore((s) => s.isLoading);

  useEffect(() => {
    if (!user?.id) return;
    loadAudits(user.id).catch(() => {
      // Keep UI usable even when backend fetch fails.
    });
  }, [user?.id, loadAudits]);

  const mappedAudits = audits.map((a) => {
    const location =
      typeof a.audit_location === 'object' && a.audit_location
        ? 'GPS Tagged'
        : 'Location pending';

    const statusMap: Record<string, 'draft' | 'submitted' | 'verified' | 'synced' | 'failed'> = {
      draft: 'draft',
      in_progress: 'draft',
      submitted: 'submitted',
      approved: 'verified',
      rejected: 'failed',
    };

    return {
      id: a.id,
      farmName: `Farm ${a.farm_id.slice(0, 8)}`,
      date: new Date(a.updated_at || a.created_at).toLocaleDateString('en-TZ', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: statusMap[a.status] ?? 'draft',
      location,
    };
  });

  return (
    <AuditList
      audits={mappedAudits}
      isLoading={isLoading}
      onAuditClick={(id) => navigate(`/audit/${id}`)}
      onNewAudit={() => navigate('/audit/new')}
    />
  );
};

const AuditWizardWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const addToast = useUIStore((s) => s.addToast);
  const user = useAuthStore((s) => s.user);
  const createAudit = useAuditStore((s) => s.createAudit);
  const submitAudit = useAuditStore((s) => s.submitAudit);

  return (
    <AuditWizard
      auditId={id}
      onComplete={async (data) => {
        const location =
          typeof data.latitude === 'number' && typeof data.longitude === 'number'
            ? { latitude: data.latitude, longitude: data.longitude }
            : null;
        const gpsAccuracy =
          typeof data.gps_accuracy === 'number'
            ? data.gps_accuracy
            : typeof data.yield_gps_accuracy === 'number'
              ? data.yield_gps_accuracy
              : null;

        try {
          if (id) {
            await submitAudit(id);
          } else {
            const created = await createAudit({
              campaign_id: null,
              farm_id: (typeof data.farm_id === 'string' && data.farm_id) || crypto.randomUUID(),
              assigned_to: user?.id ?? null,
              status: 'submitted',
              audit_location: location,
              gps_accuracy_m: gpsAccuracy,
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
            });
            await submitAudit(created.id);
          }

          addToast({ type: 'success', message: 'Audit submitted successfully.' });
          navigate('/audits');
        } catch {
          addToast({ type: 'error', message: 'Failed to submit audit. Please try again.' });
          throw new Error('Submit failed');
        }
      }}
    />
  );
};

const CalendarWrapper: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const addToast = useUIStore((s) => s.addToast);
  const [events, setEvents] = useState<Array<{
    id: string;
    title: string;
    type: 'audit' | 'training' | 'meeting' | 'deadline';
    date: string;
    time: string;
    location: string;
    notes?: string;
  }>>([]);

  useEffect(() => {
    if (!user?.id) return;
    schedule
      .getEvents(user.id)
      .then((rows) => {
        const mapped = rows.map((r) => {
          const start = new Date(r.start_time || r.created_at);
          const typeMap: Record<string, 'audit' | 'training' | 'meeting' | 'deadline'> = {
            audit: 'audit',
            training: 'training',
            meeting: 'meeting',
            deadline: 'deadline',
          };
          return {
            id: r.id,
            title: r.title,
            type: typeMap[r.event_type ?? ''] ?? 'meeting',
            date: start.toISOString().slice(0, 10),
            time: start.toTimeString().slice(0, 5),
            location: r.description ?? '',
            notes: r.description ?? '',
          };
        });
        setEvents(mapped);
      })
      .catch(() => {
        addToast({ type: 'warning', message: 'Could not load schedule from server.' });
      });
  }, [user?.id, addToast]);

  return (
    <CalendarScreen
      events={events}
      onAddEvent={async (event) => {
        try {
          const isoStart = new Date(`${event.date}T${event.time}:00`).toISOString();
          const created = await schedule.createEvent({
            title: event.title,
            description: event.notes || event.location || null,
            start_time: isoStart,
            end_time: null,
            assigned_to: user?.id ?? null,
            event_type: event.type,
            status: 'pending',
          });

          setEvents((prev) => [
            ...prev,
            {
              id: created.id,
              title: event.title,
              type: event.type,
              date: event.date,
              time: event.time,
              location: event.location,
              notes: event.notes,
            },
          ]);
          addToast({ type: 'success', message: 'Event created.' });
        } catch {
          addToast({ type: 'error', message: 'Failed to create event.' });
        }
      }}
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

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/welcome" replace />;
};

// ─── Settings Screen (basic) ────────────────────────────────────────────────
const SettingsPlaceholder: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary font-base px-6 pt-12 pb-40">
      <div className="max-w-[760px] mx-auto">
        <h1 className="text-[24px] font-light text-white font-heading tracking-tight mb-8">
          Settings
        </h1>

        <div className="nuru-glassmorphism rounded-[32px] p-8 mb-6 space-y-6">
          <div>
            <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em] mb-2">Name</div>
            <div className="text-[15px] text-white font-medium">{user?.fullName || 'N/A'}</div>
          </div>
          <div className="border-t border-white/5" />
          <div>
            <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em] mb-2">Email</div>
            <div className="text-[15px] text-white font-medium">{user?.email || 'N/A'}</div>
          </div>
          <div className="border-t border-white/5" />
          <div>
            <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em] mb-2">Role</div>
            <div className="text-[15px] text-white font-medium capitalize">{user?.role || 'N/A'}</div>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            navigate('/auth/login');
          }}
          className="w-full py-4 px-6 bg-error/10 text-error border border-error/20 rounded-full text-sm font-bold uppercase tracking-[0.1em] cursor-pointer font-base active:scale-[0.98] transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default App;
