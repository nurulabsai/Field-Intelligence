import React, { useEffect, useMemo, useRef, useState, lazy } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, useUIStore, useAuditStore } from '../store/index';
import { schedule, dashboard, uploadYieldPhotosFromFormData, auth, dimActors } from '../lib/supabase';
import { normalizeTanzanianPhoneInput } from '../lib/phone';
import { enqueueAuditSync, drainSyncQueue } from '../lib/syncService';
import {
  buildLocalWizardDashboardRow,
  inferWizardKind,
  LOCAL_WIZARD_DRAFT_ID,
} from '../lib/localWizardDraft';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Lazy-loaded screens (preserves code splitting from the old App.tsx layout)
const SignUpScreen = lazy(() => import('../screens/auth/SignUpScreen'));
const LoginScreen = lazy(() => import('../screens/auth/LoginScreen'));
const WelcomeScreen = lazy(() => import('../screens/auth/WelcomeScreen'));
const DashboardHome = lazy(() => import('../screens/dashboard/DashboardHome'));
const AuditList = lazy(() => import('../screens/audit/AuditList'));
const AuditWizard = lazy(() => import('../screens/audit/AuditWizard'));
const CalendarScreen = lazy(() => import('../screens/schedule/CalendarScreen'));
const BusinessWizard = lazy(() => import('../screens/audit/BusinessWizard'));

// ─── Auth Wrappers ──────────────────────────────────────────────────────────
export const WelcomeWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <WelcomeScreen
      onNavigateToLogin={() => navigate('/auth/login')}
      onNavigateToSignUp={() => navigate('/auth/signup')}
    />
  );
};

export const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const addToast = useUIStore((s) => s.addToast);

  return (
    <LoginScreen
      onLogin={async (data) => {
        await signIn(data.email, data.password);
        navigate('/dashboard');
      }}
      onNavigateToSignUp={() => navigate('/auth/signup')}
      onForgotPassword={async (email) => {
        if (!email) {
          addToast({ type: 'warning', message: 'Enter your email first, then tap Forgot Password.' });
          return;
        }
        try {
          await auth.resetPassword(email);
          addToast({ type: 'success', message: 'Password reset email sent. Check your inbox.' });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Could not send reset email.';
          addToast({ type: 'error', message: msg });
        }
      }}
    />
  );
};

export const SignUpWrapper: React.FC = () => {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);

  return (
    <SignUpScreen
      onSignUp={async (data) => {
        // Don't auto-navigate — SignUpScreen shows a "check inbox" confirmation
        // because Supabase email confirmation may be required. If confirmation
        // is disabled, the session is already live and the user can tap
        // "Back to Sign In" (which PublicOnly will redirect to /dashboard).
        await signUp(data.email, data.password, data.full_name);
      }}
      onNavigateToLogin={() => navigate('/auth/login')}
    />
  );
};

// ─── Dashboard ──────────────────────────────────────────────────────────────
export const DashboardWrapper: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const pendingSync = useUIStore((s) => s.pendingSyncCount);
  const addToast = useUIStore((s) => s.addToast);
  const setSideNavOpen = useUIStore((s) => s.setSideNavOpen);
  const navigate = useNavigate();
  const currentDraft = useAuditStore((s) => s.currentDraft);
  const currentStep = useAuditStore((s) => s.currentStep);
  const activeWizardKind = useAuditStore((s) => s.activeWizardKind);
  const draftUpdatedAt = useAuditStore((s) => s.draftUpdatedAt);
  const draftRestored = useAuditStore((s) => s.draftRestored);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ totalAudits: number; submittedToday: number; pendingSync: number; verified: number }>();
  const [audits, setAudits] = useState<Array<{ id: string; farmName: string; auditType: string; date: string; status: 'draft' | 'submitted' | 'verified' | 'synced' | 'failed' }> | undefined>(undefined);
  const [prices, setPrices] = useState<Array<{ id: string; crop: string; region: string; pricePerKg: number; change: number }> | undefined>(undefined);
  const [stressAlert, setStressAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    setIsLoading(true);
    Promise.all([
      dashboard.getStats(user.id),
      dashboard.getRecentAudits(user.id, 10),
      dashboard.getCropPrices(undefined, 12),
    ])
      .then(([s, recent, market]) => {
        if (controller.signal.aborted) return;
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
          assigned: 'draft',
          in_progress: 'draft',
          submitted: 'submitted',
          under_review: 'submitted',
          approved: 'verified',
          rejected: 'failed',
          requires_correction: 'failed',
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
        if (controller.signal.aborted) return;
        setStressAlert("Can't reach the server. Showing your last synced data.");
        setAudits(undefined);
        setPrices(undefined);
        setStats(undefined);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [user?.id, addToast]);

  useEffect(() => {
    setStats((prev) => (prev ? { ...prev, pendingSync } : prev));
  }, [pendingSync]);

  const displayAudits = useMemo(() => {
    const local =
      draftRestored &&
      buildLocalWizardDashboardRow(
        currentDraft,
        currentStep,
        activeWizardKind,
        draftUpdatedAt,
      );
    const base = audits ?? [];
    if (!local) {
      if (audits === undefined) return undefined;
      return base;
    }
    return [local, ...base.filter((a) => a.id !== LOCAL_WIZARD_DRAFT_ID)];
  }, [
    audits,
    currentDraft,
    currentStep,
    activeWizardKind,
    draftUpdatedAt,
    draftRestored,
  ]);

  return (
    <DashboardHome
      userName={user?.fullName}
      isLoading={isLoading}
      stats={stats}
      audits={displayAudits}
      prices={prices}
      stressAlert={stressAlert}
      onAuditClick={(id) => {
        if (id === LOCAL_WIZARD_DRAFT_ID) {
          const st = useAuditStore.getState();
          const kind =
            st.activeWizardKind
            ?? inferWizardKind(st.currentDraft as Record<string, unknown> | null);
          navigate(
            kind === 'business' ? '/audit/wizard/business' : '/audit/wizard/farm',
          );
          return;
        }
        navigate(`/audit/${id}`);
      }}
      onViewAllAudits={() => navigate('/audits')}
      onStartNewAudit={() => navigate('/audit/new')}
      onMenuPress={() => setSideNavOpen(true)}
      onProfilePress={() => navigate('/settings')}
    />
  );
};

// ─── Audit helpers ──────────────────────────────────────────────────────────
async function tryUploadYieldPhotos(
  addToast: (t: { type: 'warning'; message: string }) => void,
  auditId: string,
  farmId: string,
  formData: Record<string, unknown>,
): Promise<void> {
  try {
    await uploadYieldPhotosFromFormData(auditId, farmId, formData);
  } catch (err) {
    console.error('[audit photos]', err);
    addToast({
      type: 'warning',
      message:
        'Audit saved but some photos could not be uploaded. Create the Storage bucket and policies in Supabase (see .env.example).',
    });
  }
}

function escapeCsvCell(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadAuditsCsv(
  rows: Array<{ id: string; farmName: string; date: string; status: string; location?: string }>,
): void {
  const header = ['id', 'farmName', 'date', 'status', 'location'].map(escapeCsvCell).join(',');
  const body = rows.map((a) =>
    [a.id, a.farmName, a.date, a.status, a.location ?? '']
      .map((x) => escapeCsvCell(String(x)))
      .join(','),
  );
  const blob = new Blob([[header, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nuruos-audits-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Audit Wrappers ─────────────────────────────────────────────────────────
export const AuditListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addToast = useUIStore((s) => s.addToast);
  const audits = useAuditStore((s) => s.audits);
  const loadAudits = useAuditStore((s) => s.loadAudits);
  const isLoading = useAuditStore((s) => s.isLoading);
  const currentDraft = useAuditStore((s) => s.currentDraft);
  const currentStep = useAuditStore((s) => s.currentStep);
  const activeWizardKind = useAuditStore((s) => s.activeWizardKind);
  const draftUpdatedAt = useAuditStore((s) => s.draftUpdatedAt);
  const draftRestored = useAuditStore((s) => s.draftRestored);

  useEffect(() => {
    if (!user?.id) return;
    loadAudits(user.id).catch(() => {
      // Keep UI usable even when Supabase fetch fails.
    });
  }, [user?.id, loadAudits]);

  const mappedAudits = useMemo(
    () =>
      audits.map((a) => {
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
      }),
    [audits],
  );

  const mappedAuditsWithLocal = useMemo(() => {
    const local =
      draftRestored &&
      buildLocalWizardDashboardRow(
        currentDraft,
        currentStep,
        activeWizardKind,
        draftUpdatedAt,
      );
    if (!local) return mappedAudits;
    const loc = {
      id: local.id,
      farmName: local.farmName,
      auditType: local.auditType,
      date: local.date,
      status: local.status,
      location: 'On device',
    };
    return [loc, ...mappedAudits.filter((a) => a.id !== LOCAL_WIZARD_DRAFT_ID)];
  }, [
    mappedAudits,
    draftRestored,
    currentDraft,
    currentStep,
    activeWizardKind,
    draftUpdatedAt,
  ]);

  return (
    <AuditList
      audits={mappedAuditsWithLocal}
      isLoading={isLoading}
      onAuditClick={(id) => {
        if (id === LOCAL_WIZARD_DRAFT_ID) {
          const st = useAuditStore.getState();
          const kind =
            st.activeWizardKind
            ?? inferWizardKind(st.currentDraft as Record<string, unknown> | null);
          navigate(
            kind === 'business' ? '/audit/wizard/business' : '/audit/wizard/farm',
          );
          return;
        }
        navigate(`/audit/${id}`);
      }}
      onSettingsPress={() => navigate('/settings')}
      onExportCsv={() => {
        if (mappedAuditsWithLocal.length === 0) {
          addToast({ type: 'warning', message: 'No audits to export yet.' });
          return;
        }
        downloadAuditsCsv(mappedAuditsWithLocal);
        addToast({ type: 'success', message: 'CSV downloaded.' });
      }}
      onFilterDatesPress={() =>
        addToast({
          type: 'info',
          message: 'Date range filters will be available in a future update.',
        })
      }
      onRetrySyncPress={async () => {
        try {
          await drainSyncQueue();
          addToast({ type: 'success', message: 'Sync queue processed.' });
        } catch {
          addToast({ type: 'error', message: 'Could not run sync.' });
        }
      }}
    />
  );
};

export const AuditWizardWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const addToast = useUIStore((s) => s.addToast);
  const isOnline = useUIStore((s) => s.isOnline);
  const user = useAuthStore((s) => s.user);
  const createAudit = useAuditStore((s) => s.createAudit);
  const submitAudit = useAuditStore((s) => s.submitAudit);
  const resetDraft = useAuditStore((s) => s.resetDraft);

  return (
    <AuditWizard
      auditId={id}
      onComplete={async (data) => {
        const d = data as Record<string, unknown>;
        const phoneNorm = normalizeTanzanianPhoneInput(String(d.farmer_phone ?? ''));
        if (/^\+255[1-9]\d{8}$/.test(phoneNorm)) {
          try {
            await dimActors.upsertFarmer({
              phone_e164: phoneNorm,
              full_name: String(d.farmer_name ?? ''),
              gender: String(d.farmer_gender ?? '') || null,
              date_of_birth: String(d.farmer_dob ?? '') || null,
              national_id: String(d.farmer_national_id ?? '').trim() || null,
            });
          } catch {
            // Table may not exist yet; do not block audit submit.
          }
        }

        const loc =
          typeof data.latitude === 'number' && typeof data.longitude === 'number'
            ? { latitude: data.latitude, longitude: data.longitude }
            : null;
        const gpsAccuracy =
          typeof data.gps_accuracy === 'number'
            ? data.gps_accuracy
            : typeof data.yield_gps_accuracy === 'number'
              ? data.yield_gps_accuracy
              : null;

        const farmLocalId = typeof data.farm_id === 'string' && data.farm_id
          ? data.farm_id
          : crypto.randomUUID();

        const auditRow = {
          campaign_id: null,
          farm_id: farmLocalId,
          workflow_template_id: '',
          assigned_to: user?.id ?? null,
          status: 'submitted' as const,
          audit_location: loc,
          gps_accuracy_m: gpsAccuracy,
          started_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
        };

        try {
          if (id) {
            await submitAudit(id);
            await tryUploadYieldPhotos(addToast, id, farmLocalId, data as Record<string, unknown>);
          } else {
            const created = await createAudit(auditRow);
            await submitAudit(created.id);
            await tryUploadYieldPhotos(
              addToast,
              created.id,
              farmLocalId,
              data as Record<string, unknown>,
            );
          }

          addToast({ type: 'success', message: 'Audit submitted successfully.' });
          navigate('/audits');
        } catch {
          if (!isOnline || !navigator.onLine) {
            await enqueueAuditSync({
              auditRow,
              existingAuditId: id,
              formData: data,
            });
            resetDraft();
            addToast({
              type: 'warning',
              message: 'You\'re offline — audit queued and will sync automatically.',
            });
            navigate('/audits');
          } else {
            addToast({ type: 'error', message: 'Failed to submit audit. Please try again.' });
            throw new Error('Submit failed');
          }
        }
      }}
    />
  );
};

export const BusinessWizardWrapper: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const isOnline = useUIStore((s) => s.isOnline);
  const user = useAuthStore((s) => s.user);
  const createAudit = useAuditStore((s) => s.createAudit);
  const submitAudit = useAuditStore((s) => s.submitAudit);
  const resetDraft = useAuditStore((s) => s.resetDraft);

  return (
    <BusinessWizard
      onComplete={async (data) => {
        const auditRow = {
          campaign_id: null,
          farm_id: crypto.randomUUID(),
          workflow_template_id: '',
          assigned_to: user?.id ?? null,
          status: 'submitted' as const,
          audit_location: null,
          gps_accuracy_m: null,
          started_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
        };

        try {
          const created = await createAudit(auditRow);
          await submitAudit(created.id);
          await tryUploadYieldPhotos(
            addToast,
            created.id,
            created.farm_id,
            data as Record<string, unknown>,
          );
          addToast({ type: 'success', message: 'Business audit submitted successfully.' });
          navigate('/audits');
        } catch {
          if (!isOnline || !navigator.onLine) {
            await enqueueAuditSync({
              auditRow,
              formData: data,
            });
            resetDraft();
            addToast({
              type: 'warning',
              message: 'You\'re offline — audit queued and will sync automatically.',
            });
            navigate('/audits');
          } else {
            addToast({ type: 'error', message: 'Failed to submit audit. Please try again.' });
            throw new Error('Submit failed');
          }
        }
      }}
    />
  );
};

// ─── Schedule ───────────────────────────────────────────────────────────────
export const CalendarWrapper: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const addToast = useUIStore((s) => s.addToast);
  const loadErrorShown = useRef(false);
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
        loadErrorShown.current = false;
        const mapped = rows.map((r) => {
          const start = new Date(r.due_date || r.created_at);
          const typeMap: Record<string, 'audit' | 'training' | 'meeting' | 'deadline'> = {
            audit: 'audit',
            training: 'training',
            meeting: 'meeting',
            deadline: 'deadline',
            schedule: 'meeting',
          };
          return {
            id: r.id,
            title: r.title,
            type: typeMap[r.entity_type ?? ''] ?? 'meeting',
            date: start.toISOString().slice(0, 10),
            time: start.toTimeString().slice(0, 5),
            location: r.description ?? '',
            notes: r.description ?? '',
          };
        });
        setEvents(mapped);
      })
      .catch(() => {
        if (!loadErrorShown.current) {
          loadErrorShown.current = true;
          addToast({ type: 'warning', message: 'Could not load schedule from server.' });
        }
      });
  }, [user?.id, addToast]);

  return (
    <CalendarScreen
      events={events}
      onSearchPress={() =>
        addToast({ type: 'info', message: 'Schedule search is not available yet.' })
      }
      onNotificationsPress={() =>
        addToast({ type: 'info', message: 'No new notifications.' })
      }
      onAddEvent={async (event) => {
        try {
          const isoStart = new Date(`${event.date}T${event.time}:00`).toISOString();
          const created = await schedule.createEvent({
            entity_type: event.type,
            entity_id: '',
            title: event.title,
            description: event.notes || event.location || null,
            assigned_to: user?.id ?? null,
            due_date: isoStart,
            priority: 'medium',
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
export const SplashRedirect: React.FC = () => {
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

// ─── Settings ───────────────────────────────────────────────────────────────
export const SettingsScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const pendingSync = useUIStore((s) => s.pendingSyncCount);
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const addToast = useUIStore((s) => s.addToast);
  const navigate = useNavigate();
  const [draining, setDraining] = useState(false);

  const handleDrain = async () => {
    setDraining(true);
    try {
      await drainSyncQueue();
      addToast({ type: 'success', message: 'Sync queue processed.' });
    } catch {
      addToast({ type: 'error', message: 'Could not run sync.' });
    } finally {
      setDraining(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      addToast({ type: 'warning', message: 'No email on file for your account.' });
      return;
    }
    try {
      await auth.resetPassword(user.email);
      addToast({ type: 'success', message: 'Password reset email sent.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send reset email.';
      addToast({ type: 'error', message: msg });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary font-base px-6 md:px-10 pt-12 pb-48 md:pb-16">
      <div className="max-w-[760px] mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-text-secondary text-sm font-medium bg-transparent border-none cursor-pointer font-inherit hover:text-white transition-colors"
        >
          <span aria-hidden>←</span> Back
        </button>
        <h1 className="text-[24px] font-light text-white font-heading tracking-tight mb-8">
          Settings
        </h1>

        <section aria-label="Language" className="nuru-glassmorphism rounded-[32px] p-8 mb-6 space-y-4">
          <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.15em]">
            Language / Lugha
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 rounded-full text-sm font-semibold border cursor-pointer font-inherit transition-colors ${
                language === 'en'
                  ? 'bg-accent text-black border-accent'
                  : 'bg-transparent text-text-secondary border-white/10 hover:border-white/20'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('sw')}
              className={`flex-1 py-3 rounded-full text-sm font-semibold border cursor-pointer font-inherit transition-colors ${
                language === 'sw'
                  ? 'bg-accent text-black border-accent'
                  : 'bg-transparent text-text-secondary border-white/10 hover:border-white/20'
              }`}
            >
              Kiswahili
            </button>
          </div>
        </section>

        <section aria-label="Account" className="nuru-glassmorphism rounded-[32px] p-8 mb-6 space-y-6">
          <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.15em]">
            Account
          </h2>
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
        </section>

        <section aria-label="Sync" className="nuru-glassmorphism rounded-[32px] p-8 mb-6 space-y-5">
          <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.15em]">
            Offline Sync
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-white font-medium">Pending audits</div>
              <div className="text-xs text-text-secondary">
                {pendingSync === 0 ? 'All synced' : `${pendingSync} waiting to upload`}
              </div>
            </div>
            <button
              type="button"
              onClick={handleDrain}
              disabled={draining || pendingSync === 0}
              className="bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-full px-5 py-3 cursor-pointer disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {draining ? 'Syncing…' : 'Sync now'}
            </button>
          </div>
        </section>

        <section aria-label="Security" className="nuru-glassmorphism rounded-[32px] p-8 mb-6 space-y-5">
          <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.15em]">
            Security
          </h2>
          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full text-left flex items-center justify-between bg-transparent border-none cursor-pointer font-inherit text-white hover:text-accent transition-colors"
          >
            <div>
              <div className="text-[13px] font-medium">Reset password</div>
              <div className="text-xs text-text-secondary">We'll email you a secure reset link</div>
            </div>
            <span aria-hidden className="text-text-tertiary">→</span>
          </button>
        </section>

        <button
          onClick={async () => {
            await signOut();
            navigate('/auth/login');
          }}
          className="w-full py-4 px-6 bg-transparent text-white/70 hover:text-white hover:bg-white/5 border border-white/10 rounded-full text-sm font-bold uppercase tracking-[0.1em] cursor-pointer font-base active:scale-[0.98] transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
