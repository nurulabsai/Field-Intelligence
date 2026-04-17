/* ============================================================
   NuruOS Field Intelligence – Service Worker v4
   Offline-first strategy:
     • App shell  → Network first for navigations, cache fallback
     • Static assets → Stale-While-Revalidate
     • Supabase/API traffic is not cached here (handled by the client SDK)
   Background Sync: queues failed sync calls and retries
   when connectivity is restored.
   ============================================================ */

const CACHE_NAME = 'nuruos-shell-v4';
const SYNC_TAG = 'nuruos-sync-queue';

// App-shell assets to pre-cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  // The actual hashed JS/CSS filenames are unknown at SW write-time
  // so we rely on runtime caching for them.
];

// ── Install: pre-cache app shell ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          // Non-fatal: some assets may not exist yet in dev
          console.warn('[SW] Pre-cache partial failure:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ── Activate: prune old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const VALID_CACHES = new Set([CACHE_NAME]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!VALID_CACHES.has(key)) {
            console.debug('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ──────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Navigation requests → Network First, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // 2. Skip chrome-extension and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // 3. Everything else → Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
              cache.put(request, networkRes.clone());
            }
            return networkRes;
          })
          .catch(() => undefined);

        return cached || networkFetch;
      })
    )
  );
});

// ── Background Sync: retry pending audit syncs ───────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      // Notify all open clients to run the sync queue
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC', tag: SYNC_TAG });
        });
      })
    );
  }
});

// ── Push Notifications (future-ready) ────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'NuruOS', {
        body: data.body || '',
        icon: data.icon || '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: data.tag || 'nuruos-notification',
        data: data.url ? { url: data.url } : {},
      })
    );
  } catch (_) {
    // ignore malformed push data
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ── Message handler: trigger sync from app ───────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'REGISTER_SYNC') {
    self.registration.sync
      .register(SYNC_TAG)
      .catch((err) => console.warn('[SW] Sync register failed:', err));
  }
});
