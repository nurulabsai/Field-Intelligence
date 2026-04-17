/**
 * Offline Sync Service — NuruOS Field Intelligence
 *
 * Manages the lifecycle of queued operations:
 *   enqueueAuditSync() – stash a failed/offline submission
 *   drainSyncQueue()   – replay pending ops when connectivity returns
 *   refreshPendingCount() – keep the UI badge accurate
 *
 * Coordinates with the service worker via postMessage and the
 * Background Sync API where supported.
 */

import {
  enqueueSync,
  getAllSyncEntries,
  updateSyncEntry,
  deleteSyncEntry,
  getSyncQueueCount,
  type SyncQueueEntry,
} from './offlineDb';
import { audits as auditsApi, uploadYieldPhotosFromFormData } from './supabase';
import type { FarmAuditRow } from './supabase';

type PendingCountListener = (count: number) => void;

let listeners: PendingCountListener[] = [];
let draining = false;

/** Optional UI hook — registered from App to avoid circular store imports. */
let syncPermanentFailureHandler: (() => void) | null = null;

export function registerSyncPermanentFailureHandler(fn: (() => void) | null): void {
  syncPermanentFailureHandler = fn;
}

// ---------------------------------------------------------------------------
// Listener management (the store subscribes to this)
// ---------------------------------------------------------------------------

export function onPendingCountChange(fn: PendingCountListener): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

async function notifyListeners(): Promise<void> {
  const count = await getSyncQueueCount();
  listeners.forEach((fn) => fn(count));
}

// ---------------------------------------------------------------------------
// Enqueue an audit submission that failed or happened offline
// ---------------------------------------------------------------------------

export interface AuditSyncPayload {
  auditRow: Omit<FarmAuditRow, 'id' | 'created_at' | 'updated_at'>;
  existingAuditId?: string;
  formData: Record<string, unknown>;
}

export async function enqueueAuditSync(
  payload: AuditSyncPayload,
): Promise<number> {
  const id = await enqueueSync({
    type: 'create_and_submit_audit',
    payload: payload as unknown as Record<string, unknown>,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  });

  await notifyListeners();
  requestBackgroundSync();
  return id;
}

// ---------------------------------------------------------------------------
// Drain the queue (called on reconnect or from SW BACKGROUND_SYNC)
// ---------------------------------------------------------------------------

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 16_000;

/** Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s cap. */
function backoffDelay(retryCount: number): number {
  const exponential = Math.min(BASE_DELAY_MS * 2 ** retryCount, MAX_DELAY_MS);
  const jitter = Math.random() * exponential * 0.3;
  return exponential + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function drainSyncQueue(): Promise<void> {
  if (draining) return;
  if (!navigator.onLine) return;

  draining = true;
  try {
    const entries = await getAllSyncEntries();
    const pending = entries.filter(
      (e) =>
        e.status !== 'in_flight' &&
        !(e.status === 'failed' && e.retryCount >= MAX_RETRIES),
    );

    for (const entry of pending) {
      if (entry.retryCount > 0) {
        await sleep(backoffDelay(entry.retryCount - 1));
      }
      if (!navigator.onLine) break;
      await processEntry(entry);
      await notifyListeners();
    }
  } finally {
    draining = false;
  }
}

async function processEntry(entry: SyncQueueEntry): Promise<void> {
  if (!entry.id) return;

  entry.status = 'in_flight';
  entry.lastAttempt = new Date().toISOString();
  await updateSyncEntry(entry);

  try {
    if (entry.type === 'create_and_submit_audit') {
      const p = entry.payload as unknown as AuditSyncPayload;

      let auditId: string;
      if (p.existingAuditId) {
        await auditsApi.submit(p.existingAuditId);
        auditId = p.existingAuditId;
      } else {
        const created = await auditsApi.create(p.auditRow);
        await auditsApi.submit(created.id);
        auditId = created.id;
      }

      const farmId = p.auditRow.farm_id;
      if (farmId) {
        await uploadYieldPhotosFromFormData(auditId, farmId, p.formData);
      }
    }

    await deleteSyncEntry(entry.id);
  } catch {
    entry.status = 'failed';
    entry.retryCount += 1;

    if (entry.retryCount >= MAX_RETRIES) {
      entry.status = 'failed';
    } else {
      entry.status = 'pending';
    }

    await updateSyncEntry(entry);

    if (entry.retryCount >= MAX_RETRIES) {
      syncPermanentFailureHandler?.();
    }
  }
}

// ---------------------------------------------------------------------------
// Background Sync registration + message handler
// ---------------------------------------------------------------------------

function requestBackgroundSync(): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready
    .then((reg) => {
      if ('sync' in reg) {
        (reg as unknown as { sync: { register(tag: string): Promise<void> } })
          .sync.register('nuruos-sync-queue')
          .catch(() => {
            // Background Sync not supported or permission denied — fall back
            // to draining on next online event (already wired).
          });
      }
    })
    .catch(() => {});
}

export function handleServiceWorkerMessage(event: MessageEvent): void {
  if (event.data?.type === 'BACKGROUND_SYNC') {
    drainSyncQueue();
  }
}

// ---------------------------------------------------------------------------
// Refresh count (used on init)
// ---------------------------------------------------------------------------

export async function refreshPendingCount(): Promise<number> {
  const count = await getSyncQueueCount();
  listeners.forEach((fn) => fn(count));
  return count;
}
