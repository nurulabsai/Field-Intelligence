import type { FarmerProfile } from '../types/farmerTypes';
import type { AuditFormState } from '../types/auditTypes';

const DB_NAME = 'nuruos-audit-storage';
const DB_VERSION = 1;
const DRAFTS_STORE = 'audit_drafts';
const FARMERS_STORE = 'farmers';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE, { keyPath: 'auditId' });
      }
      if (!db.objectStoreNames.contains(FARMERS_STORE)) {
        const store = db.createObjectStore(FARMERS_STORE, { keyPath: 'localId' });
        store.createIndex('phone_number', 'identity.phoneNumber', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function findFarmerByPhone(phone: string): Promise<FarmerProfile | null> {
  const normalized = phone.replace(/\s/g, '');
  const db = await openDB();
  const tx = db.transaction(FARMERS_STORE, 'readonly');
  const store = tx.objectStore(FARMERS_STORE);

  return new Promise((resolve, reject) => {
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(null);
        return;
      }
      const farmer = cursor.value as FarmerProfile;
      const storedPhone = farmer.identity.phoneNumber.replace(/\s/g, '');
      if (storedPhone === normalized) {
        resolve(farmer);
        return;
      }
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveAuditDraft(auditId: string, state: AuditFormState): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DRAFTS_STORE, 'readwrite');
  tx.objectStore(DRAFTS_STORE).put({
    ...state,
    auditId,
    lastSavedAt: new Date().toISOString(),
  });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAuditDraft(auditId: string): Promise<AuditFormState | null> {
  const db = await openDB();
  const tx = db.transaction(DRAFTS_STORE, 'readonly');
  const req = tx.objectStore(DRAFTS_STORE).get(auditId);
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as AuditFormState | null ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFarmerLocally(farmer: FarmerProfile): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(FARMERS_STORE, 'readwrite');
  tx.objectStore(FARMERS_STORE).put(farmer);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
