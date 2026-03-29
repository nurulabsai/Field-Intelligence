import { saveAuditLocally, getPendingSyncs } from './storageService';
import { getDB, appendSyncLog } from './db';
import { AuditRecord, AuditImage } from '../types';
import { submitAuditToGoogleSheets } from './googleSheetsService';
import { processAIQueue } from './offlineAIService';
import { farmAuditService, mapAuditToFarmAuditPayload } from './farmAuditService';

let isSyncing = false;

export const isOnline = () => navigator.onLine;

// ── Cloudflare R2 Upload ──────────────────────────────────────────────────────
const R2_BUCKET_URL   = import.meta.env.VITE_R2_BUCKET_URL   || '';
const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_ENDPOINT || '';

/**
 * Upload an image to Cloudflare R2.
 * Falls back to keeping the local data URL when the backend is not configured,
 * so the app works fully offline / in dev without env vars.
 */
const uploadImageToR2 = async (image: AuditImage): Promise<string> => {
  if (!UPLOAD_ENDPOINT || !R2_BUCKET_URL) {
    // No backend configured: keep local dataUrl as the "public" URL
    return image.dataUrl || image.storageUrl || '';
  }

  // 1. Get a presigned URL from our backend
  const { uploadUrl, publicUrl } = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageId: image.id,
      auditId: image.auditId,
      contentType: 'image/jpeg',
    }),
  }).then((r) => {
    if (!r.ok) throw new Error(`Upload endpoint returned HTTP ${r.status}`);
    return r.json() as Promise<{ uploadUrl: string; publicUrl: string }>;
  });

  // 2. Convert dataUrl → Blob and PUT to R2
  const blob = await fetch(image.dataUrl!).then((r) => r.blob());
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'image/jpeg' },
  });
  if (!putRes.ok) throw new Error(`R2 PUT returned HTTP ${putRes.status}`);

  return publicUrl;
};

/** Upload all unsynced images for a given audit. Returns true if all succeeded. */
const syncImagesForAudit = async (auditId: string): Promise<boolean> => {
  const db = await getDB();

  const images = await new Promise<AuditImage[]>((resolve, reject) => {
    const tx  = db.transaction(['images'], 'readonly');
    const idx = tx.objectStore('images').index('auditId');
    const req = idx.getAll(auditId);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });

  let allSynced = true;

  for (const img of images) {
    // Skip already-synced or images with no local data
    if (img.synced || (!img.dataUrl && img.storageUrl)) continue;

    try {
      const publicUrl = await uploadImageToR2(img);

      const isRemoteUrl = publicUrl && !publicUrl.startsWith('data:');
      const updatedImg: AuditImage = {
        ...img,
        dataUrl:    isRemoteUrl ? undefined : publicUrl,  // free memory if uploaded
        storageUrl: isRemoteUrl ? publicUrl : img.storageUrl,
        synced: true,
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['images'], 'readwrite');
        tx.objectStore('images').put(updatedImg);
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
      });

      await appendSyncLog({
        auditId, timestamp: new Date().toISOString(),
        success: true, destination: 'r2',
      });

    } catch (e) {
      console.error(`[R2] Failed to upload image ${img.id}:`, e);
      await appendSyncLog({
        auditId, timestamp: new Date().toISOString(),
        success: false, destination: 'r2',
        errorMessage: (e as Error)?.message,
      });
      allSynced = false;
    }
  }

  return allSynced;
};

// ── Single audit sync ─────────────────────────────────────────────────────────
export const syncItem = async (audit: AuditRecord): Promise<void> => {
  const t0 = Date.now();

  try {
    // 1. Upload images first
    const imagesSynced = await syncImagesForAudit(audit.id);
    if (!imagesSynced) throw new Error('Image upload incomplete. Will retry.');

    // 2. Reload images with updated URLs
    const db = await getDB();
    const freshImages = await new Promise<AuditImage[]>((resolve) => {
      const tx  = db.transaction(['images'], 'readonly');
      const idx = tx.objectStore('images').index('auditId');
      idx.getAll(audit.id).onsuccess = (e: any) => resolve(e.target.result ?? []);
    });
    const auditWithUrls = { ...audit, images: freshImages };

    // 3. Submit: Farm audits with boundary → Supabase; others → Google Sheets
    let destination: 'supabase' | 'sheets' = 'sheets';
    const farmPayload = mapAuditToFarmAuditPayload(auditWithUrls);

    if (farmPayload) {
      try {
        const result = await farmAuditService.create(farmPayload);
        if (result?.audit_id) {
          destination = 'supabase';
          (audit as any).supabaseAuditId = result.audit_id;
        } else {
          await submitAuditToGoogleSheets(auditWithUrls);
        }
      } catch (supaErr) {
        console.warn('[Sync] Supabase failed, falling back to Sheets:', supaErr);
        await submitAuditToGoogleSheets(auditWithUrls);
      }
    } else {
      await submitAuditToGoogleSheets(auditWithUrls);
    }

    // 4. Mark synced
    audit.status          = 'synced';
    audit.syncRetryCount  = 0;
    audit.lastSyncAttempt = new Date().toISOString();
    await saveAuditLocally(audit);

    await appendSyncLog({
      auditId: audit.id, timestamp: new Date().toISOString(),
      success: true, destination, durationMs: Date.now() - t0,
    });

  } catch (error) {
    console.error(`[Sync] Failed for ${audit.id}:`, error);

    const retries = (audit.syncRetryCount || 0) + 1;
    audit.syncRetryCount  = retries;
    audit.lastSyncAttempt = new Date().toISOString();
    audit.status          = retries >= 5 ? 'failed' : 'pending';
    await saveAuditLocally(audit);

    await appendSyncLog({
      auditId: audit.id, timestamp: new Date().toISOString(),
      success: false, destination: 'sheets',
      errorMessage: (error as Error)?.message, durationMs: Date.now() - t0,
    });

    throw error;
  }
};

// ── Batch sync ────────────────────────────────────────────────────────────────
export const processSyncQueue = async (
  onProgress?: (msg: string) => void
): Promise<{ synced: number; failed: number }> => {
  if (isSyncing || !isOnline()) return { synced: 0, failed: 0 };

  isSyncing = true;
  let syncedCount = 0;
  let failedCount = 0;
  const BATCH_SIZE = 5;

  try {
    if (onProgress) onProgress('Processing offline AI tasks…');
    await processAIQueue().catch(() => {});

    const pendingAudits = await getPendingSyncs();
    const total = pendingAudits.length;

    if (total === 0) return { synced: 0, failed: 0 };

    if (onProgress) onProgress(`Starting sync for ${total} audit(s)…`);

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = pendingAudits.slice(i, i + BATCH_SIZE);
      if (onProgress) onProgress(`Syncing batch ${Math.floor(i / BATCH_SIZE) + 1}…`);

      const results = await Promise.allSettled(batch.map((a) => syncItem(a)));
      results.forEach((r) => (r.status === 'fulfilled' ? syncedCount++ : failedCount++));
    }

    if (onProgress) {
      onProgress(
        failedCount > 0
          ? `Done. ${syncedCount} synced, ${failedCount} failed.`
          : `All ${syncedCount} audit(s) synced successfully!`
      );
    }

    // Register background sync for retries
    if (failedCount > 0 && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => (reg as any).sync?.register('nuruos-sync-queue').catch(() => {}))
        .catch(() => {});
    }

  } finally {
    isSyncing = false;
  }

  return { synced: syncedCount, failed: failedCount };
};
