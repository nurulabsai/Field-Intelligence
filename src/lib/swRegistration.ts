/**
 * Service Worker Registration — NuruOS Field Intelligence
 *
 * Registers the existing service-worker.js, wires up the
 * BACKGROUND_SYNC message handler, and triggers a queue drain
 * whenever the browser transitions from offline → online.
 */

import { handleServiceWorkerMessage, drainSyncQueue } from './syncService';

let registered = false;

export async function registerServiceWorker(): Promise<void> {
  if (registered) return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  registered = true;

  try {
    const reg = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'activated' &&
          navigator.serviceWorker.controller
        ) {
          // A new SW version activated — the user gets it on next navigation.
          // We could prompt a reload here, but for a field app silent is safer.
        }
      });
    });
  } catch (err) {
    console.warn('[SW] Registration failed:', err);
  }

  navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

  window.addEventListener('online', () => {
    drainSyncQueue();
  });
}
