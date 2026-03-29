import { getDB } from './db';
import { supabase } from '../lib/supabaseClient';
import { DISTRICTS_BY_REGION } from './validationService';

const REFERENCE_KEYS = {
  DIM_LOCATIONS: 'dim_locations',
  DIM_CROPS: 'dim_crops',
} as const;

export interface LocationRecord {
  id?: string;
  region?: string;
  district?: string;
  ward?: string;
  [key: string]: unknown;
}

export const referenceDataService = {
  async getFromCache<T>(key: string): Promise<T | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('reference_data', 'readonly');
      const req = tx.objectStore('reference_data').get(key);
      req.onsuccess = () => resolve((req.result?.value ?? null) as T | null);
      req.onerror = () => reject(req.error);
    });
  },

  async saveToCache(key: string, value: unknown): Promise<void> {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('reference_data', 'readwrite');
      tx.objectStore('reference_data').put({ key, value, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getDistrictsForRegion(region: string): Promise<string[]> {
    const cached = await this.getFromCache<LocationRecord[]>(REFERENCE_KEYS.DIM_LOCATIONS);
    if (cached && Array.isArray(cached)) {
      const districts = [...new Set(cached.filter((l) => l.region === region).map((l) => l.district).filter(Boolean))];
      if (districts.length > 0) return districts as string[];
    }
    return DISTRICTS_BY_REGION[region] ?? [];
  },

  async cacheLocations(): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { data, error } = await supabase.from('dim_locations').select('*');
      if (error) throw error;
      if (data) {
        await this.saveToCache(REFERENCE_KEYS.DIM_LOCATIONS, data);
        return true;
      }
    } catch (e) {
      console.warn('[ReferenceData] Failed to cache locations:', e);
    }
    return false;
  },

  async isCached(): Promise<boolean> {
    const cached = await this.getFromCache(REFERENCE_KEYS.DIM_LOCATIONS);
    return cached !== null && Array.isArray(cached) && cached.length > 0;
  },
};
