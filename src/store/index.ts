/**
 * Zustand Stores — NuruOS Field Intelligence
 *
 * Three stores with IndexedDB persistence for offline-first:
 *   authStore  – authentication state
 *   auditStore – audit drafts & list
 *   uiStore    – connectivity, UI chrome, toasts
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel, createStore as createIDBStore } from 'idb-keyval';
import { auth as authApi, audits as auditsApi, type FarmAuditRow } from '../lib/supabase';
import type { FullAuditData } from '../lib/validations';

// ---------------------------------------------------------------------------
// IndexedDB storage adapter for Zustand persist
// ---------------------------------------------------------------------------

const hasIndexedDB = typeof indexedDB !== 'undefined';
const idbStore = hasIndexedDB ? createIDBStore('nuruos-store-db', 'zustand') : undefined;

function createIDBStorage() {
  // Fall back to localStorage when IndexedDB is unavailable (tests, SSR)
  if (!hasIndexedDB || !idbStore) {
    return createJSONStorage<unknown>(() => localStorage);
  }

  return createJSONStorage<unknown>(() => ({
    getItem: async (name: string) => {
      const value = await idbGet<string>(name, idbStore);
      return value ?? null;
    },
    setItem: async (name: string, value: string) => {
      await idbSet(name, value, idbStore);
    },
    removeItem: async (name: string) => {
      await idbDel(name, idbStore);
    },
  }));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// ---------------------------------------------------------------------------
// Auth Store (persisted to IndexedDB)
// ---------------------------------------------------------------------------

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,

      async signIn(email: string, password: string) {
        set({ isLoading: true });
        try {
          const result = await authApi.signIn(email, password);
          const u = result.user;
          set({
            user: u
              ? {
                  id: u.id,
                  email: u.email ?? '',
                  fullName: (u.user_metadata?.full_name as string) ?? '',
                  role: (u.user_metadata?.role as string) ?? 'auditor',
                }
              : null,
            session: result.session
              ? {
                  accessToken: result.session.access_token,
                  refreshToken: result.session.refresh_token,
                  expiresAt: result.session.expires_at ?? 0,
                }
              : null,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      async signUp(email: string, password: string, fullName: string) {
        set({ isLoading: true });
        try {
          const result = await authApi.signUp(email, password, fullName);
          const u = result.user;
          set({
            user: u
              ? {
                  id: u.id,
                  email: u.email ?? '',
                  fullName,
                  role: 'auditor',
                }
              : null,
            session: result.session
              ? {
                  accessToken: result.session.access_token,
                  refreshToken: result.session.refresh_token,
                  expiresAt: result.session.expires_at ?? 0,
                }
              : null,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      async signOut() {
        await authApi.signOut();
        set({ user: null, session: null });
      },

      async restoreSession() {
        set({ isLoading: true });
        try {
          const session = await authApi.getSession();
          if (session) {
            const u = session.user;
            set({
              user: {
                id: u.id,
                email: u.email ?? '',
                fullName: (u.user_metadata?.full_name as string) ?? '',
                role: (u.user_metadata?.role as string) ?? 'auditor',
              },
              session: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: session.expires_at ?? 0,
              },
              isLoading: false,
            });
          } else {
            set({ user: null, session: null, isLoading: false });
          }
        } catch {
          set({ user: null, session: null, isLoading: false });
        }
      },

      setUser(user) {
        set({ user });
      },

      setSession(session) {
        set({ session });
      },
    }),
    {
      name: 'nuruos-auth',
      storage: createIDBStorage(),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Audit Store (persisted to IndexedDB)
// ---------------------------------------------------------------------------

interface AuditState {
  audits: FarmAuditRow[];
  currentDraft: Partial<FullAuditData> | null;
  currentStep: number;
  isLoading: boolean;
  setStep: (step: number) => void;
  saveDraft: (data: Partial<FullAuditData>) => void;
  resetDraft: () => void;
  submitAudit: (auditId: string) => Promise<void>;
  loadAudits: (userId: string) => Promise<void>;
  createAudit: (audit: Omit<FarmAuditRow, 'id' | 'created_at' | 'updated_at'>) => Promise<FarmAuditRow>;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      audits: [],
      currentDraft: null,
      currentStep: 0,
      isLoading: false,

      setStep(step: number) {
        set({ currentStep: step });
      },

      saveDraft(data: Partial<FullAuditData>) {
        const existing = get().currentDraft ?? {};
        set({ currentDraft: { ...existing, ...data } });
      },

      resetDraft() {
        set({ currentDraft: null, currentStep: 0 });
      },

      async submitAudit(auditId: string) {
        set({ isLoading: true });
        try {
          const updated = await auditsApi.submit(auditId);
          set((state) => ({
            audits: state.audits.map((a) => (a.id === auditId ? updated : a)),
            currentDraft: null,
            currentStep: 0,
            isLoading: false,
          }));
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      async loadAudits(userId: string) {
        set({ isLoading: true });
        try {
          const { data } = await auditsApi.list(userId);
          set({ audits: data, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      async createAudit(audit) {
        set({ isLoading: true });
        try {
          const created = await auditsApi.create(audit);
          set((state) => ({
            audits: [created, ...state.audits],
            isLoading: false,
          }));
          return created;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },
    }),
    {
      name: 'nuruos-audits',
      storage: createIDBStorage(),
      partialize: (state) => ({
        audits: state.audits,
        currentDraft: state.currentDraft,
        currentStep: state.currentStep,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// UI Store (persisted to IndexedDB — preferences only)
// ---------------------------------------------------------------------------

interface UIState {
  isOnline: boolean;
  pendingSyncCount: number;
  sideNavOpen: boolean;
  theme: 'dark' | 'light';
  language: 'en' | 'sw';
  toasts: Toast[];
  setOnline: (online: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  incrementPendingSync: () => void;
  decrementPendingSync: () => void;
  toggleSideNav: () => void;
  setSideNavOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (lang: 'en' | 'sw') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingSyncCount: 0,
      sideNavOpen: false,
      theme: 'dark',
      language: 'en',
      toasts: [],

      setOnline(online: boolean) {
        set({ isOnline: online });
      },

      setPendingSyncCount(count: number) {
        set({ pendingSyncCount: count });
      },

      incrementPendingSync() {
        set((s) => ({ pendingSyncCount: s.pendingSyncCount + 1 }));
      },

      decrementPendingSync() {
        set((s) => ({ pendingSyncCount: Math.max(0, s.pendingSyncCount - 1) }));
      },

      toggleSideNav() {
        set((s) => ({ sideNavOpen: !s.sideNavOpen }));
      },

      setSideNavOpen(open: boolean) {
        set({ sideNavOpen: open });
      },

      setTheme(theme: 'dark' | 'light') {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      setLanguage(lang: 'en' | 'sw') {
        set({ language: lang });
      },

      addToast(toast: Omit<Toast, 'id'>) {
        const id = crypto.randomUUID();
        const newToast: Toast = { ...toast, id };
        set((s) => ({ toasts: [...s.toasts, newToast] }));

        const duration = toast.duration ?? 4000;
        if (duration > 0) {
          setTimeout(() => {
            const current = get().toasts;
            set({ toasts: current.filter((t) => t.id !== id) });
          }, duration);
        }
      },

      removeToast(id: string) {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      },

      clearToasts() {
        set({ toasts: [] });
      },
    }),
    {
      name: 'nuruos-ui',
      storage: createIDBStorage(),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        pendingSyncCount: state.pendingSyncCount,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Online/offline listeners (self-initializing side-effect)
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useUIStore.getState().setOnline(true));
  window.addEventListener('offline', () => useUIStore.getState().setOnline(false));

  if (import.meta.env.DEV) {
    (window as any).__authStore = useAuthStore;
    (window as any).__auditStore = useAuditStore;
    (window as any).__uiStore = useUIStore;
  }
}
