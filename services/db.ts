const DB_NAME    = 'AuditProDB';
const DB_VERSION = 4; // bumped: added settings + sync_log stores

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // ── audits store ───────────────────────────────────────────────
      if (!db.objectStoreNames.contains('audits')) {
        const auditStore = db.createObjectStore('audits', { keyPath: 'id' });
        auditStore.createIndex('status',    'status',    { unique: false });
        auditStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        auditStore.createIndex('type',      'type',      { unique: false });
      } else {
        // Add 'type' index if upgrading from v3
        const tx = (event.target as IDBOpenDBRequest).transaction!;
        const store = tx.objectStore('audits');
        if (!store.indexNames.contains('type')) {
          store.createIndex('type', 'type', { unique: false });
        }
      }

      // ── images store ───────────────────────────────────────────────
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('auditId', 'auditId', { unique: false });
        imageStore.createIndex('synced',  'synced',  { unique: false });
      }

      // ── ai_queue store ─────────────────────────────────────────────
      if (!db.objectStoreNames.contains('ai_queue')) {
        db.createObjectStore('ai_queue', { keyPath: 'id' });
      }

      // ── drafts store ───────────────────────────────────────────────
      if (!db.objectStoreNames.contains('drafts')) {
        const draftStore = db.createObjectStore('drafts', { keyPath: 'templateId' });
        draftStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // ── reference_data store ───────────────────────────────────────
      if (!db.objectStoreNames.contains('reference_data')) {
        db.createObjectStore('reference_data', { keyPath: 'key' });
      }

      // ── settings store (v4) ────────────────────────────────────────
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // ── sync_log store (v4) ────────────────────────────────────────
      if (!db.objectStoreNames.contains('sync_log')) {
        const syncLog = db.createObjectStore('sync_log', {
          keyPath: 'id',
          autoIncrement: true,
        });
        syncLog.createIndex('auditId',   'auditId',   { unique: false });
        syncLog.createIndex('timestamp', 'timestamp', { unique: false });
        syncLog.createIndex('success',   'success',   { unique: false });
      }
    };
  });
};

export const getDB = async (): Promise<IDBDatabase> => {
  return initDB();
};

// ── Typed helpers ────────────────────────────────────────────────────────────

export interface AppSetting {
  key: string;
  value: any;
  updatedAt: string;
}

export const getSetting = async <T = any>(key: string): Promise<T | null> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('settings', 'readonly').objectStore('settings').get(key);
    req.onsuccess = () => resolve(req.result ? (req.result.value as T) : null);
    req.onerror = () => reject(req.error);
  });
};

export const setSetting = async (key: string, value: any): Promise<void> => {
  const db = await getDB();
  const record: AppSetting = { key, value, updatedAt: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export interface SyncLogEntry {
  id?: number; // auto-generated
  auditId: string;
  timestamp: string;
  success: boolean;
  destination: 'supabase' | 'sheets' | 'r2';
  errorMessage?: string;
  durationMs?: number;
}

export const appendSyncLog = async (entry: Omit<SyncLogEntry, 'id'>): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_log', 'readwrite');
    tx.objectStore('sync_log').add({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getRecentSyncLogs = async (limit = 50): Promise<SyncLogEntry[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('sync_log', 'readonly');
    const idx = tx.objectStore('sync_log').index('timestamp');
    const req = idx.openCursor(null, 'prev'); // newest first
    const logs: SyncLogEntry[] = [];
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor && logs.length < limit) {
        logs.push(cursor.value);
        cursor.continue();
      } else {
        resolve(logs);
      }
    };
    req.onerror = () => reject(req.error);
  });
};
