/**
 * Local (IndexedDB) wizard draft — metadata for dashboard / audit list rows.
 */

import type { FullAuditData } from './validations';

export type WizardKind = 'farm' | 'business';

/** Synthetic id for the single active in-browser draft (not a Supabase row). */
export const LOCAL_WIZARD_DRAFT_ID = 'local-wizard-draft';

export function inferWizardKind(d: Record<string, unknown> | null | undefined): WizardKind {
  if (!d || typeof d !== 'object') return 'farm';
  if (typeof d.enumerator_name === 'string' && d.enumerator_name.trim()) return 'business';
  if (typeof d.business_name === 'string' && d.business_name.trim()) return 'business';
  if (typeof d.stakeholder_type === 'string' && d.stakeholder_type.trim()) return 'business';
  if (d.farm_profile && typeof d.farm_profile === 'object') return 'farm';
  return 'farm';
}

function localDraftTitle(d: Record<string, unknown>, kind: WizardKind): string {
  if (kind === 'business') {
    const name =
      (typeof d.business_name === 'string' && d.business_name.trim())
      || (typeof d.owner_name === 'string' && d.owner_name.trim());
    return name || 'Business inspection (draft)';
  }
  const fp = d.farm_profile as { farm_name?: string; farmer_name?: string } | undefined;
  const name =
    (fp?.farm_name && String(fp.farm_name).trim())
    || (typeof d.farm_name === 'string' && d.farm_name.trim())
    || (fp?.farmer_name && String(fp.farmer_name).trim())
    || (typeof d.farmer_name === 'string' && d.farmer_name.trim());
  return name || 'Farm audit (draft)';
}

const hasText = (v: unknown): boolean => typeof v === 'string' && v.trim().length > 0;

/**
 * True when there is enough local state to show an “ongoing” row (wizard opened
 * with seeded defaults, or any field filled, or past step 0).
 */
export function shouldListLocalWizardDraft(
  draft: Partial<FullAuditData> | null | undefined,
  step: number,
): boolean {
  if (!draft || typeof draft !== 'object') return false;
  if (step > 0) return true;
  const d = draft as Record<string, unknown>;
  if (hasText(d.farmer_name) || hasText(d.farm_name) || hasText(d.enumerator_name) || hasText(d.business_name)) {
    return true;
  }
  const fp = d.farm_profile as { farm_name?: string; farmer_name?: string } | undefined;
  if (fp && (hasText(fp.farm_name) || hasText(fp.farmer_name))) return true;
  if (d.farm_profile || d.farm_boundary || Array.isArray(d.plots)) return true;
  if (d.stakeholder_type || hasText(d.district as string)) return true;
  return false;
}

export function buildLocalWizardDashboardRow(
  draft: Partial<FullAuditData> | null | undefined,
  step: number,
  kind: WizardKind | null | undefined,
  updatedAtIso: string | null | undefined,
): {
  id: string;
  farmName: string;
  auditType: string;
  date: string;
  status: 'draft';
} | null {
  if (!shouldListLocalWizardDraft(draft, step)) return null;
  const d = draft as Record<string, unknown>;
  const resolved = kind ?? inferWizardKind(d);
  const dateSrc = updatedAtIso ? new Date(updatedAtIso) : new Date();
  const date = dateSrc.toLocaleDateString('en-TZ', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return {
    id: LOCAL_WIZARD_DRAFT_ID,
    farmName: localDraftTitle(d, resolved),
    auditType: resolved === 'business' ? 'Business Audit' : 'Farm Audit',
    date,
    status: 'draft',
  };
}
