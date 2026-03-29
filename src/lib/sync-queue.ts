/**
 * IndexedDB-backed offline sync queue for PWA field audit operations.
 * Uses idb-keyval with a custom store; auto-drains when connectivity returns.
 */

import { get, set, del, keys, createStore } from 'idb-keyval';
import { audits, photos } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OperationType = 'create_audit' | 'submit_audit' | 'upload_photo';
export type QueueItemStatus = 'pending' | 'in_progress' | 'failed';

export interface QueueItem {
  readonly id: string;
  readonly type: OperationType;
  readonly payload: Record<string, unknown>;
  readonly status: QueueItemStatus;
  readonly retryCount: number;
  readonly createdAt: string;
  readonly lastAttempt: string | null;
}

type SyncEventType = 'enqueued' | 'processing' | 'completed' | 'failed' | 'drain_start' | 'drain_end';

export interface SyncEvent {
  readonly type: SyncEventType;
  readonly item?: QueueItem;
  readonly error?: string;
  readonly queueSize?: number;
}

type SyncListener = (event: SyncEvent) => void;

// ---------------------------------------------------------------------------
// Constants & Store
// ---------------------------------------------------------------------------

const STORE = createStore('nuruos-sync-queue', 'queue-items');
const MAX_RETRIES = 5;

// ---------------------------------------------------------------------------
// Event bus (simple callback pattern)
// ---------------------------------------------------------------------------

const listeners = new Set<SyncListener>();

export function onSyncEvent(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(event: SyncEvent): void {
  listeners.forEach((fn) => fn(event));
}

// ---------------------------------------------------------------------------
// UUID helper (crypto-based, no dependency)
// ---------------------------------------------------------------------------

function uuid(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Queue operations
// ---------------------------------------------------------------------------

export async function enqueue(
  type: OperationType,
  payload: Record<string, unknown>,
): Promise<string> {
  const id = uuid();
  const item: QueueItem = {
    id,
    type,
    payload,
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString(),
    lastAttempt: null,
  };
  await set(id, item, STORE);
  emit({ type: 'enqueued', item, queueSize: (await getAllItems()).length });
  return id;
}

export async function dequeue(id: string): Promise<void> {
  await del(id, STORE);
}

export async function getQueue(): Promise<readonly QueueItem[]> {
  const items = await getAllItems();
  return items.filter((i) => i.status === 'pending' || i.status === 'failed');
}

export async function getQueueCount(): Promise<number> {
  return (await getQueue()).length;
}

export async function clearCompleted(): Promise<void> {
  const allKeys = await keys<string>(STORE);
  const removals = allKeys.map(async (key) => {
    const item = await get<QueueItem>(key, STORE);
    if (!item || (item.status !== 'pending' && item.status !== 'in_progress' && item.status !== 'failed')) {
      await del(key, STORE);
    }
  });
  await Promise.all(removals);
}

// ---------------------------------------------------------------------------
// Drain logic with exponential backoff
// ---------------------------------------------------------------------------

let draining = false;

export async function drainQueue(): Promise<void> {
  if (draining || !navigator.onLine) return;
  draining = true;
  emit({ type: 'drain_start' });

  try {
    const pending = await getQueue();
    for (const item of pending) {
      if (!navigator.onLine) break;
      if (item.retryCount >= MAX_RETRIES) continue;

      const delay = item.retryCount > 0 ? Math.pow(2, item.retryCount) * 1000 : 0;
      if (item.lastAttempt) {
        const elapsed = Date.now() - new Date(item.lastAttempt).getTime();
        if (elapsed < delay) continue;
      }

      const inProgress: QueueItem = { ...item, status: 'in_progress', lastAttempt: new Date().toISOString() };
      await set(item.id, inProgress, STORE);
      emit({ type: 'processing', item: inProgress });

      try {
        await processItem(inProgress);
        await del(item.id, STORE);
        emit({ type: 'completed', item: inProgress });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const failed: QueueItem = {
          ...inProgress,
          status: 'failed',
          retryCount: inProgress.retryCount + 1,
        };
        await set(item.id, failed, STORE);
        emit({ type: 'failed', item: failed, error: message });
      }
    }
  } finally {
    draining = false;
    const remaining = await getQueueCount();
    emit({ type: 'drain_end', queueSize: remaining });
  }
}

// ---------------------------------------------------------------------------
// Operation dispatcher
// ---------------------------------------------------------------------------

async function processItem(item: QueueItem): Promise<void> {
  switch (item.type) {
    case 'create_audit':
      await audits.create(item.payload as Parameters<typeof audits.create>[0]);
      break;
    case 'submit_audit': {
      const auditId = item.payload['auditId'] as string;
      if (!auditId) throw new Error('submit_audit requires auditId in payload');
      await audits.submit(auditId);
      break;
    }
    case 'upload_photo':
      await photos.create(item.payload as Parameters<typeof photos.create>[0]);
      break;
    default: {
      const _exhaustive: never = item.type;
      throw new Error(`Unknown operation type: ${_exhaustive}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getAllItems(): Promise<readonly QueueItem[]> {
  const allKeys = await keys<string>(STORE);
  const items = await Promise.all(allKeys.map((key) => get<QueueItem>(key, STORE)));
  return items.filter((item): item is QueueItem => item !== undefined);
}

// ---------------------------------------------------------------------------
// Auto-drain on connectivity restoration
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void drainQueue();
  });
}

// ---------------------------------------------------------------------------
// Service worker background sync listener
// ---------------------------------------------------------------------------

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
    const data = event.data as Record<string, unknown> | null;
    if (data && data['type'] === 'BACKGROUND_SYNC') {
      void drainQueue();
    }
  });
}
