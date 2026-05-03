/**
 * Structured consent capture types — OR-TAMISEMI compliant.
 *
 * Mirrors the public.audit_consent_records table created in
 * supabase/migrations/003_audit_consent_and_plot_gps.sql.
 *
 * Polymorphic subject: exactly one of subject_farmer_id / subject_actor_id.
 *   - farm_audit: subject is a farmer (FK to public.farmers.id)
 *   - business_audit: subject is an actor/agribusiness (FK to public.dim_actors.id)
 */

export type ConsentLanguage = 'sw' | 'en';

export type ConsentMethod = 'signature' | 'thumbprint' | 'verbal_witnessed';

export type ConsentAuditType = 'farm_audit' | 'business_audit';

export interface ConsentRecord {
  // Offline idempotency
  client_id: string; // UUID generated client-side

  // Polymorphic subject — exactly one set
  subject_farmer_id?: string | null;
  subject_actor_id?: string | null;

  // Optional FK to triggering audit
  farm_audit_id?: string | null;
  audit_type: ConsentAuditType;

  // Identity confirmation
  subject_name_confirmed: string;
  subject_id_confirmed?: string;

  // Granular flags — UI gates progress until all five are true
  consent_data_collection: boolean;
  consent_data_sharing_ortamisemi: boolean;
  consent_data_sharing_government: boolean;
  consent_photo_capture: boolean;
  consent_gps_location: boolean;

  // Informed-consent metadata
  language_of_consent: ConsentLanguage;
  consent_read_aloud: boolean;
  subject_literate: boolean | null;
  right_to_withdraw_explained: boolean;

  // Method + signature/witness
  consent_method: ConsentMethod;
  consent_signature_data?: string; // base64 PNG, kept locally until upload
  consent_signature_storage_path?: string;
  witness_name?: string;
  witness_phone?: string;

  // Spatial / temporal provenance
  consent_given_at: string; // ISO timestamp
  consent_location_lat?: number;
  consent_location_lng?: number;

  // Versioning & device
  form_version: string;
  device_id?: string;

  // Local sync flags
  synced?: boolean;
}

export const CONSENT_FORM_VERSION = 'v1';

export const REQUIRED_CONSENT_FLAGS: Array<keyof ConsentRecord> = [
  'consent_data_collection',
  'consent_data_sharing_ortamisemi',
  'consent_data_sharing_government',
  'consent_photo_capture',
  'consent_gps_location',
  'right_to_withdraw_explained',
];

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createConsentRecord(
  audit_type: ConsentAuditType,
  language: ConsentLanguage = 'sw',
): ConsentRecord {
  return {
    client_id: uuidv4(),
    subject_farmer_id: null,
    subject_actor_id: null,
    farm_audit_id: null,
    audit_type,
    subject_name_confirmed: '',
    subject_id_confirmed: '',
    consent_data_collection: false,
    consent_data_sharing_ortamisemi: false,
    consent_data_sharing_government: false,
    consent_photo_capture: false,
    consent_gps_location: false,
    language_of_consent: language,
    consent_read_aloud: false,
    subject_literate: null,
    right_to_withdraw_explained: false,
    consent_method: 'signature',
    consent_signature_data: undefined,
    witness_name: '',
    witness_phone: '',
    consent_given_at: '',
    consent_location_lat: undefined,
    consent_location_lng: undefined,
    form_version: CONSENT_FORM_VERSION,
    synced: false,
  };
}

/**
 * Returns true when all required consent flags are checked AND a valid
 * method+signature/witness has been captured AND the subject name is set.
 * Use this to gate wizard progression past the consent step.
 */
export function isConsentComplete(c: ConsentRecord): boolean {
  if (!c.subject_name_confirmed.trim()) return false;
  for (const flag of REQUIRED_CONSENT_FLAGS) {
    if (c[flag] !== true) return false;
  }
  if (c.consent_method === 'signature' || c.consent_method === 'thumbprint') {
    if (!c.consent_signature_data) return false;
  }
  if (c.consent_method === 'verbal_witnessed') {
    if (!c.witness_name?.trim()) return false;
  }
  return true;
}
