/**
 * IndexedDB persistence layer — NuruOS Field Intelligence
 *
 * Two object stores:
 *   syncQueue – pending network operations that will be retried on reconnect
 *   drafts    – wizard draft snapshots keyed by a stable draft ID
 */

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

function tx(
  storeName: string,
  mode: IDBTransactionMode,
): Promise<IDBObjectStore> {
  return openDb().then((db) => {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  });
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Sync Queue operations
// ---------------------------------------------------------------------------

export async function enqueueSync(
  entry: Omit<SyncQueueEntry, 'id'>,
): Promise<number> {
  try {
    const store = await tx(STORE_SYNC_QUEUE, 'readwrite');
    const key = await idbRequest(store.add(entry));
    return key as number;
  } catch (e) {
    notifyQuotaExceeded(e);
    throw e;
  }
}

export async function getAllSyncEntries(): Promise<SyncQueueEntry[]> {
  const store = await tx(STORE_SYNC_QUEUE, 'readonly');
  return idbRequest(store.getAll());
}

export async function getSyncEntry(id: number): Promise<SyncQueueEntry | undefined> {
  const store = await tx(STORE_SYNC_QUEUE, 'readonly');
  return idbRequest(store.get(id));
}

export async function updateSyncEntry(entry: SyncQueueEntry): Promise<void> {
  const store = await tx(STORE_SYNC_QUEUE, 'readwrite');
  await idbRequest(store.put(entry));
}

export async function deleteSyncEntry(id: number): Promise<void> {
  const store = await tx(STORE_SYNC_QUEUE, 'readwrite');
  await idbRequest(store.delete(id));
}

export async function getSyncQueueCount(): Promise<number> {
  const store = await tx(STORE_SYNC_QUEUE, 'readonly');
  return idbRequest(store.count());
}

export async function clearSyncQueue(): Promise<void> {
  const store = await tx(STORE_SYNC_QUEUE, 'readwrite');
  await idbRequest(store.clear());
}

// ---------------------------------------------------------------------------
// Draft operations
// ---------------------------------------------------------------------------

const ACTIVE_DRAFT_ID = 'active-wizard-draft';

export async function saveDraftToDb(
  currentStep: number,
  formData: Record<string, unknown>,
): Promise<void> {
  try {
    const store = await tx(STORE_DRAFTS, 'readwrite');
    const entry: DraftEntry = {
      id: ACTIVE_DRAFT_ID,
      currentStep,
      formData,
      updatedAt: new Date().toISOString(),
    };
    await idbRequest(store.put(entry));
  } catch (e) {
    notifyQuotaExceeded(e);
    throw e;
  }
}

export async function loadDraftFromDb(): Promise<DraftEntry | undefined> {
  const store = await tx(STORE_DRAFTS, 'readonly');
  return idbRequest(store.get(ACTIVE_DRAFT_ID));
}

export async function clearDraftFromDb(): Promise<void> {
  const store = await tx(STORE_DRAFTS, 'readwrite');
  await idbRequest(store.delete(ACTIVE_DRAFT_ID));
}
