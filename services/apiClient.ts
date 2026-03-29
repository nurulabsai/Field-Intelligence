/**
 * API Client for Backend Integration
 * Handles authentication, retries, and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  retry?: number;
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = sessionStorage.getItem('auth_token');
  }

  private saveToken(token: string) {
    this.token = token;
    sessionStorage.setItem('auth_token', token);
  }

  private clearToken() {
    this.token = null;
    sessionStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { requiresAuth = false, retry = 3, ...fetchConfig } = config;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };

    if (requiresAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    for (let attempt = 1; attempt <= retry; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchConfig,
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            this.clearToken();
            throw new Error('Authentication failed. Please login again.');
          }

          const error = await response.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error: any) {
        if (attempt === retry) throw error;

        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Request failed after retries');
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const result = await this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.saveToken(result.token);
    return result;
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
    const result = await this.request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    this.saveToken(result.token);
    return result;
  }

  // Upload methods
  async getPresignedUrl(fileName: string, contentType: string = 'image/jpeg', options?: {
    mediaType?: 'image' | 'audio' | 'video' | 'document';
    auditId?: string;
  }): Promise<{
    uploadUrl: string;
    publicUrl: string;
    key: string;
    mediaType?: string;
  }> {
    return this.request('/api/upload/presign', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ 
        fileName, 
        contentType,
        mediaType: options?.mediaType,
        auditId: options?.auditId,
      }),
    });
  }

  async uploadImage(blob: Blob, fileName: string, auditId?: string): Promise<string> {
    const { uploadUrl, publicUrl } = await this.getPresignedUrl(fileName, blob.type || 'image/jpeg', {
      mediaType: 'image',
      auditId,
    });

    await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': blob.type || 'image/jpeg' },
    });

    return publicUrl;
  }

  async uploadVoiceNote(blob: Blob, auditId: string, fieldId?: string): Promise<string> {
    // Use the special voice-note endpoint
    const { uploadUrl, publicUrl } = await this.request<{
      uploadUrl: string;
      publicUrl: string;
      key: string;
    }>('/api/upload/voice-note', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ auditId, fieldId }),
    });

    await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'audio/webm' },
    });

    return publicUrl;
  }

  async uploadPhoto(blob: Blob, auditId: string, label?: string): Promise<string> {
    // Use the special photo endpoint
    const { uploadUrl, publicUrl } = await this.request<{
      uploadUrl: string;
      publicUrl: string;
      key: string;
    }>('/api/upload/photo', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ auditId, label, contentType: blob.type || 'image/jpeg' }),
    });

    await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': blob.type || 'image/jpeg' },
    });

    return publicUrl;
  }

  async uploadFile(blob: Blob, fileName: string, auditId?: string): Promise<string> {
    // Determine media type from blob type
    let mediaType: 'image' | 'audio' | 'video' | 'document' = 'document';
    if (blob.type.startsWith('image/')) mediaType = 'image';
    else if (blob.type.startsWith('audio/')) mediaType = 'audio';
    else if (blob.type.startsWith('video/')) mediaType = 'video';

    const { uploadUrl, publicUrl } = await this.getPresignedUrl(fileName, blob.type, {
      mediaType,
      auditId,
    });

    await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': blob.type },
    });

    return publicUrl;
  }

  // Audit methods
  async syncAudit(audit: any): Promise<{ success: boolean; message: string }> {
    return this.request('/api/audits/sync', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(audit),
    });
  }

  async batchSyncAudits(audits: any[]): Promise<{ success: boolean; message: string }> {
    return this.request('/api/audits/batch-sync', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(audits),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout() {
    this.clearToken();
  }
}

export const apiClient = new APIClient(API_BASE_URL);
