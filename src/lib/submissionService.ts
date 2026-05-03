import { audits as auditsApi, uploadYieldPhotosFromFormData, type FarmAuditRow } from './supabase';

const AUDIT_ID_MAP_KEY = 'nuru_audit_submission_id_map_v1';

interface AuditIdMap {
  [clientId: string]: string;
}

function readAuditIdMap(): AuditIdMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(AUDIT_ID_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as AuditIdMap;
  } catch {
    return {};
  }
}

function writeAuditIdMap(next: AuditIdMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUDIT_ID_MAP_KEY, JSON.stringify(next));
  } catch {
    // Best effort only; sync logic still works without persistence.
  }
}

function getMappedAuditId(clientId: string | undefined): string | null {
  if (!clientId) return null;
  const map = readAuditIdMap();
  return map[clientId] ?? null;
}

function setMappedAuditId(clientId: string | undefined, auditId: string): void {
  if (!clientId) return;
  const map = readAuditIdMap();
  map[clientId] = auditId;
  writeAuditIdMap(map);
}

export interface SubmissionPayload {
  auditRow: Omit<FarmAuditRow, 'id' | 'created_at' | 'updated_at'>;
  existingAuditId?: string;
  formData: Record<string, unknown>;
  auditClientId?: string;
}

export interface SubmissionResult {
  auditId: string;
  created: boolean;
}

/**
 * Shared submission orchestration used by both direct UI flow and queued sync.
 * This keeps create/submit/upload behavior identical across online and replay paths.
 */
export async function processSubmission(payload: SubmissionPayload): Promise<SubmissionResult> {
  const mappedId = getMappedAuditId(payload.auditClientId);
  const auditId = payload.existingAuditId ?? mappedId;

  if (auditId) {
    await auditsApi.submit(auditId);
    if (payload.auditRow.farm_id) {
      await uploadYieldPhotosFromFormData(auditId, payload.auditRow.farm_id, payload.formData);
    }
    return { auditId, created: false };
  }

  const created = await auditsApi.create(payload.auditRow);
  setMappedAuditId(payload.auditClientId, created.id);
  await auditsApi.submit(created.id);
  if (payload.auditRow.farm_id) {
    await uploadYieldPhotosFromFormData(created.id, payload.auditRow.farm_id, payload.formData);
  }
  return { auditId: created.id, created: true };
}
