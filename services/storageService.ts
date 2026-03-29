
import { AuditRecord, AuditImage } from '../types';
import { getDB } from './db';
import { secureAuditData, unsecureAuditData, logError } from './securityService';

export const saveAuditLocally = async (audit: AuditRecord): Promise<void> => {
  try {
    if (!audit.id) {
        throw new Error("Cannot save audit without ID");
    }

    const db = await getDB();
    const tx = db.transaction(['audits', 'images'], 'readwrite');
    const auditsStore = tx.objectStore('audits');
    const imagesStore = tx.objectStore('images');

    // Separate images from audit data
    const { images, ...auditData } = audit;
    
    // Encrypt sensitive fields before saving
    const securedData = await secureAuditData(auditData, audit.type);

    // Update timestamp
    const recordToSave = {
      ...securedData,
      id: audit.id, // Explicitly ensure ID is set on the root object for keyPath
      updatedAt: new Date().toISOString()
    };

    // Save Audit Data
    auditsStore.put(recordToSave);

    // Save Images
    if (images && images.length > 0) {
      images.forEach(img => {
        if (img.dataUrl || img.storageUrl) {
            imagesStore.put({
            ...img,
            auditId: audit.id
            });
        }
      });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    logError(e as Error, { context: 'saveAuditLocally', auditId: audit.id });
    throw e;
  }
};

export const getAllAudits = async (): Promise<AuditRecord[]> => {
  try {
    const db = await getDB();
    const tx = db.transaction(['audits', 'images'], 'readonly');
    const auditsStore = tx.objectStore('audits');
    const imagesStore = tx.objectStore('images');

    // Get all audits
    const auditsRequest = auditsStore.getAll();
    
    return new Promise((resolve, reject) => {
      auditsRequest.onsuccess = async () => {
        const rawAudits = auditsRequest.result as any[];
        
        // Decrypt and hydration
        const fullAudits = await Promise.all(rawAudits.map(async (rawAudit) => {
          // Decrypt data
          const audit = await unsecureAuditData(rawAudit, rawAudit.type);

          const imageIndex = imagesStore.index('auditId');
          const imagesRequest = imageIndex.getAll(audit.id);
          
          return new Promise<AuditRecord>((res) => {
            imagesRequest.onsuccess = () => {
              audit.images = imagesRequest.result || [];
              res(audit);
            };
          });
        }));

        // Sort by updatedAt desc
        fullAudits.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        });

        resolve(fullAudits);
      };
      auditsRequest.onerror = () => reject(auditsRequest.error);
    });
  } catch (e) {
    logError(e as Error, { context: 'getAllAudits' });
    return [];
  }
};

export const getAuditById = async (id: string): Promise<AuditRecord | null> => {
  const db = await getDB();
  const tx = db.transaction(['audits', 'images'], 'readonly');
  const auditsStore = tx.objectStore('audits');
  const imagesStore = tx.objectStore('images');

  return new Promise((resolve, reject) => {
    const request = auditsStore.get(id);
    request.onsuccess = async () => {
      const rawAudit = request.result;
      if (!rawAudit) {
        resolve(null);
        return;
      }

      const audit = await unsecureAuditData(rawAudit, rawAudit.type);

      const imageIndex = imagesStore.index('auditId');
      const imagesRequest = imageIndex.getAll(id);
      imagesRequest.onsuccess = () => {
        audit.images = imagesRequest.result || [];
        resolve(audit);
      };
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteAudit = async (id: string): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['audits', 'images'], 'readwrite');
  const auditsStore = tx.objectStore('audits');
  const imagesStore = tx.objectStore('images');

  auditsStore.delete(id);
  
  // Delete associated images
  const imageIndex = imagesStore.index('auditId');
  const imagesRequest = imageIndex.getAllKeys(id);
  
  imagesRequest.onsuccess = () => {
    const keys = imagesRequest.result;
    keys.forEach(key => imagesStore.delete(key));
  };

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getPendingSyncs = async (): Promise<AuditRecord[]> => {
  const db = await getDB();
  const tx = db.transaction('audits', 'readonly');
  const store = tx.objectStore('audits');
  const index = store.index('status');
  const request = index.getAll('pending');

  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
        const rawResults = request.result;
        // Decrypt pending items needed for sync
        const decrypted = await Promise.all(rawResults.map(r => unsecureAuditData(r, r.type)));
        resolve(decrypted);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getStorageUsage = async (): Promise<{ used: number; quota: number }> => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  }
  return { used: 0, quota: 0 };
};

export const restoreBackup = async (file: File): Promise<{ success: boolean; count: number; message: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        
        if (!backup.audits || !Array.isArray(backup.audits)) {
          resolve({ success: false, count: 0, message: "Invalid backup file format" });
          return;
        }

        const db = await getDB();
        const tx = db.transaction(['audits', 'images'], 'readwrite');
        const auditStore = tx.objectStore('audits');
        const imageStore = tx.objectStore('images');

        let count = 0;
        for (const audit of backup.audits) {
          const { images, ...auditData } = audit;
          // When restoring, we assume backup data is plain text JSON, so we must encrypt it before saving
          const securedAudit = await secureAuditData(auditData, auditData.type);
          
          auditStore.put(securedAudit);
          
          if (images && images.length > 0) {
            for (const img of images) {
              imageStore.put({ ...img, auditId: audit.id });
            }
          }
          count++;
        }

        tx.oncomplete = () => resolve({ success: true, count, message: "Restore successful" });
        tx.onerror = () => resolve({ success: false, count: 0, message: "Database error during restore" });

      } catch (err) {
        logError(err as Error, { context: 'restoreBackup' });
        resolve({ success: false, count: 0, message: "Failed to parse backup file" });
      }
    };
    reader.readAsText(file);
  });
};