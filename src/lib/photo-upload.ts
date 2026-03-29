/**
 * Photo upload pipeline: IndexedDB → presigned URL → R2
 * Bridges the offline photo-storage module with the backend upload API.
 */

import { getPhotosForAudit, getPhotoBlob, cleanupSyncedPhotos, type PhotoRecord } from './photo-storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PresignResponse {
  readonly uploadUrl: string;
  readonly publicUrl: string;
  readonly fileName: string;
  readonly mediaType: string;
}

export interface UploadResult {
  readonly photoId: string;
  readonly publicUrl: string;
  readonly success: boolean;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function getApiBase(): string {
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
}

// ---------------------------------------------------------------------------
// Core upload flow
// ---------------------------------------------------------------------------

/** Request a presigned upload URL from the backend. */
async function getPresignedUrl(
  auditId: string,
  label: string,
  contentType: string,
  token: string,
): Promise<PresignResponse> {
  const res = await fetch(`${getApiBase()}/api/upload/photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ auditId, label, contentType }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, string>).error ?? `Presign failed: ${res.status}`);
  }

  return res.json() as Promise<PresignResponse>;
}

/** Upload a blob directly to R2 via the presigned URL. */
async function uploadToR2(blob: Blob, uploadUrl: string, contentType: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status}`);
  }
}

/** Upload a single photo from IndexedDB to R2. */
export async function uploadPhoto(
  photo: PhotoRecord,
  token: string,
): Promise<UploadResult> {
  try {
    const blob = await getPhotoBlob(photo.id);
    if (!blob) {
      return { photoId: photo.id, publicUrl: '', success: false, error: 'Blob not found in IndexedDB' };
    }

    const presign = await getPresignedUrl(
      photo.auditId,
      photo.fileName.replace(/\.[^.]+$/, ''),
      photo.mimeType || 'image/jpeg',
      token,
    );

    await uploadToR2(blob, presign.uploadUrl, photo.mimeType || 'image/jpeg');

    return { photoId: photo.id, publicUrl: presign.publicUrl, success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    return { photoId: photo.id, publicUrl: '', success: false, error: message };
  }
}

/**
 * Upload all queued photos for an audit, then clean up IndexedDB.
 * Returns results for each photo (some may fail independently).
 */
export async function uploadAuditPhotos(
  auditId: string,
  token: string,
): Promise<readonly UploadResult[]> {
  const photos = await getPhotosForAudit(auditId);

  if (photos.length === 0) return [];

  const results = await Promise.allSettled(
    photos.map((photo) => uploadPhoto(photo, token)),
  );

  const mapped = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      photoId: photos[i].id,
      publicUrl: '',
      success: false,
      error: r.reason instanceof Error ? r.reason.message : 'Upload failed',
    };
  });

  // Clean up only fully-succeeded uploads
  const allSucceeded = mapped.every((r) => r.success);
  if (allSucceeded) {
    await cleanupSyncedPhotos(auditId);
  }

  return mapped;
}
