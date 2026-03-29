import { get, set, del, keys, createStore } from 'idb-keyval';

const photoStore = createStore('nuruos-photos-db', 'photos');

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

export interface PhotoRecord {
  readonly id: string;
  readonly auditId: string;
  readonly blob: Blob;
  readonly fileName: string;
  readonly mimeType: string;
  readonly size: number;
  readonly createdAt: string;
}

function generateId(): string {
  return `photo_${Date.now()}_${crypto.randomUUID()}`;
}

export async function savePhoto(
  file: File,
  auditId: string,
): Promise<PhotoRecord> {
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error(
      `Photo exceeds maximum size of 10MB. Received: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    );
  }

  const record: PhotoRecord = {
    id: generateId(),
    auditId,
    blob: file,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
  };

  await set(record.id, record, photoStore);

  return record;
}

export async function getPhoto(
  id: string,
): Promise<PhotoRecord | undefined> {
  return get<PhotoRecord>(id, photoStore);
}

export async function getPhotosForAudit(
  auditId: string,
): Promise<PhotoRecord[]> {
  const allKeys = await keys<string>(photoStore);
  const records: PhotoRecord[] = [];

  for (const key of allKeys) {
    const record = await get<PhotoRecord>(key, photoStore);
    if (record && record.auditId === auditId) {
      records.push(record);
    }
  }

  return records.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function deletePhoto(id: string): Promise<void> {
  await del(id, photoStore);
}

export async function getPhotoBlob(
  id: string,
): Promise<Blob | undefined> {
  const record = await get<PhotoRecord>(id, photoStore);
  return record?.blob;
}

export async function getThumbnailUrl(id: string): Promise<string> {
  const record = await get<PhotoRecord>(id, photoStore);

  if (!record) {
    throw new Error(`Photo not found: ${id}`);
  }

  return URL.createObjectURL(record.blob);
}

export async function cleanupSyncedPhotos(
  auditId: string,
): Promise<void> {
  const photos = await getPhotosForAudit(auditId);

  for (const photo of photos) {
    await del(photo.id, photoStore);
  }
}
