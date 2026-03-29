import { getDB } from './db';

export interface FormDraft {
  templateId: string;
  templateName: string;
  formState: Record<string, unknown>;
  updatedAt: string;
}

export const draftService = {
  async save(templateId: string, templateName: string, formState: Record<string, unknown>): Promise<void> {
    const db = await getDB();
    const draft: FormDraft = {
      templateId,
      templateName,
      formState,
      updatedAt: new Date().toISOString(),
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      tx.objectStore('drafts').put(draft);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async get(templateId: string): Promise<FormDraft | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readonly');
      const req = tx.objectStore('drafts').get(templateId);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(templateId: string): Promise<void> {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      tx.objectStore('drafts').delete(templateId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async hasDraft(templateId: string): Promise<boolean> {
    const draft = await this.get(templateId);
    return draft !== null;
  },
};
