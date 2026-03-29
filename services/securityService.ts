
// Security & Logging Service

// --- Error Logging (Sentry Mock) ---

export const logError = (error: Error, context?: Record<string, any>) => {
  // In production, this would send to Sentry/LogRocket
  if (import.meta.env.MODE === 'production') {
    // Sentry.captureException(error, { extra: context });
    console.error("[NuruOS Production Error]", error.message, context);
  } else {
    console.error("[Dev Error]", error, context);
  }
};

export const logInfo = (message: string, data?: any) => {
  if (import.meta.env.MODE !== 'production') {
    console.log(`[Info] ${message}`, data);
  }
};

export const logSecurityEvent = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  // In production, this would send to a secure logging endpoint (e.g. Datadog)
  if (level === 'error') {
    console.error(`[Security Error] ${message}`, data);
  } else if (level === 'warn') {
    console.warn(`[Security Warning] ${message}`, data);
  } else {
    console.info(`[Security Info] ${message}`, data);
  }
};

// --- Data Encryption (Simple AES-GCM wrapper) ---

const ENC_KEY_STORAGE = 'nuruos_enc_key';

const getEncryptionKey = async (): Promise<CryptoKey> => {
  // In a real app with auth, derive this from user password.
  // For this offline-first field app, we generate a device-specific key.
  let jwk = localStorage.getItem(ENC_KEY_STORAGE);

  if (!jwk) {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    localStorage.setItem(ENC_KEY_STORAGE, JSON.stringify(exported));
    return key;
  }

  return window.crypto.subtle.importKey(
    "jwk",
    JSON.parse(jwk),
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (text: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoded
    );

    // Combine IV and data, convert to base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    logError(e as Error, { action: 'encrypt' });
    return text; // Fallback to plain text on failure to avoid data loss, but log critical error
  }
};

export const decryptData = async (base64: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    // If decryption fails (e.g., bad key, or it wasn't encrypted), return original
    return base64;
  }
};

// Helper to encrypt sensitive PII fields in an object
export const secureAuditData = async (data: any, type: 'farm' | 'business') => {
  const secured = JSON.parse(JSON.stringify(data)); // Deep copy

  if (type === 'farm' && secured.farmData) {
    if (secured.farmData.farmerFirstName)
      secured.farmData.farmerFirstName = await encryptData(secured.farmData.farmerFirstName);
    if (secured.farmData.farmerLastName)
      secured.farmData.farmerLastName = await encryptData(secured.farmData.farmerLastName);
    if (secured.farmData.primaryPhone)
      secured.farmData.primaryPhone = await encryptData(secured.farmData.primaryPhone);
  }

  // Add more fields as needed for Business
  return secured;
};

export const unsecureAuditData = async (data: any, type: 'farm' | 'business') => {
  const plain = JSON.parse(JSON.stringify(data));

  if (type === 'farm' && plain.farmData) {
    if (plain.farmData.farmerFirstName)
      plain.farmData.farmerFirstName = await decryptData(plain.farmData.farmerFirstName);
    if (plain.farmData.farmerLastName)
      plain.farmData.farmerLastName = await decryptData(plain.farmData.farmerLastName);
    if (plain.farmData.primaryPhone)
      plain.farmData.primaryPhone = await decryptData(plain.farmData.primaryPhone);
  }

  return plain;
};
