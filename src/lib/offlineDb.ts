/**
 * IndexedDB persistence layer — NuruOS Field Intelligence
 *
 * Two object stores:
 *   syncQueue – pending network operations that will be retried on reconnect
 *   drafts    – wizard draft snapshots keyed by a stable draft ID
 */

import type { WizardKind } from './localWizardDraft';

const DB_NAME = 'nuruos-field-intelligence';
const DB_VERSION = 1;

const STORE_SYNC_QUEUE = 'syncQueue';
const STORE_DRAFTS = 'drafts';

export interface SyncQueueEntry {
  id?: number;
  type: 'create_and_submit_audit';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  lastAttempt?: string;
  status: 'pending' | 'in_flight' | 'failed';
}

export interface DraftEntry {
  id: string;
  currentStep: number;
  formData: Record<string, unknown>;
  updatedAt: string;
  /** Which wizard last wrote this draft — used for resume navigation. */
  wizardKind?: WizardKind;
}

let dbPromise: Promise<IDBDatabase> | null = null;

/** Optional UI hook — registered from App (toasts). */
let quotaExceededHandler: (() => void) | null = null;

export function registerQuotaExceededHandler(fn: (() => void) | null): void {
  quotaExceededHandler = fn;
}

function notifyQuotaExceeded(e: unknown): void {
  if (e instanceof DOMException && e.name === 'QuotaExceededError') {
    quotaExceededHandler?.();
  }
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * IndexedDB auto-commits a transaction as soon as the current task yields if no
 * request was queued in the same synchronous turn as `db.transaction()`.
 * Never `await` between starting a transaction and calling `store.get/add/put`.
 */
async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tr = db.transaction(storeName, mode);
    tr.onerror = () => reject(tr.error);
    const store = tr.objectStore(storeName);
    const req = run(store);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result as T);
  });
}

// ---------------------------------------------------------------------------
// Sync Queue operations
// ---------------------------------------------------------------------------

export async function enqueueSync(
  entry: Omit<SyncQueueEntry, 'id'>,
): Promise<number> {
  try {
    const key = await withStore(STORE_SYNC_QUEUE, 'readwrite', (store) =>
      store.add(entry),
    );
    return key as number;
  } catch (e) {
    notifyQuotaExceeded(e);
    throw e;
  }
}

export async function getAllSyncEntries(): Promise<SyncQueueEntry[]> {
  return withStore(STORE_SYNC_QUEUE, 'readonly', (store) => store.getAll());
}

export async function getSyncEntry(id: number): Promise<SyncQueueEntry | undefined> {
  return withStore(STORE_SYNC_QUEUE, 'readonly', (store) => store.get(id));
}

export async function updateSyncEntry(entry: SyncQueueEntry): Promise<void> {
  await withStore(STORE_SYNC_QUEUE, 'readwrite', (store) => store.put(entry));
}

export async function deleteSyncEntry(id: number): Promise<void> {
  await withStore(STORE_SYNC_QUEUE, 'readwrite', (store) => store.delete(id));
}

export async function getSyncQueueCount(): Promise<number> {
  return withStore(STORE_SYNC_QUEUE, 'readonly', (store) => store.count());
}

export async function clearSyncQueue(): Promise<void> {
  await withStore(STORE_SYNC_QUEUE, 'readwrite', (store) => store.clear());
}

// ---------------------------------------------------------------------------
// Draft operations
// ---------------------------------------------------------------------------

const ACTIVE_DRAFT_ID = 'active-wizard-draft';

export async function saveDraftToDb(
  currentStep: number,
  formData: Record<string, unknown>,
  wizardKind?: WizardKind | null,
): Promise<string> {
  try {
    const updatedAt = new Date().toISOString();
    const entry: DraftEntry = {
      id: ACTIVE_DRAFT_ID,
      currentStep,
      formData,
      updatedAt,
      ...(wizardKind ? { wizardKind } : {}),
    };
    await withStore(STORE_DRAFTS, 'readwrite', (store) => store.put(entry));
    return updatedAt;
  } catch (e) {
    notifyQuotaExceeded(e);
    throw e;
  }
}

export async function loadDraftFromDb(): Promise<DraftEntry | undefined> {
  return withStore(STORE_DRAFTS, 'readonly', (store) => store.get(ACTIVE_DRAFT_ID));
}

export async function clearDraftFromDb(): Promise<void> {
  await withStore(STORE_DRAFTS, 'readwrite', (store) =>
    store.delete(ACTIVE_DRAFT_ID),
  );
}
