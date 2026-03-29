import { AuditRecord } from '../types';

export const submitAuditToGoogleSheets = async (audit: any): Promise<boolean> => {
  // If no webhook URL is found, fail gracefully
  // The actual implementation for submitting to Google Sheets would go here.
  // For now, we'll return true as a placeholder for a successful submission.
  return true;
};

export const flattenAuditData = (audit: AuditRecord): Record<string, any> => {
  const flat: Record<string, any> = {
    id: audit.id,
    business_name: audit.businessName,
    status: audit.status,
    created_at: audit.createdAt,
    updated_at: audit.updatedAt,
    latitude: audit.location?.latitude,
    longitude: audit.location?.longitude,
    gps_accuracy: audit.location?.accuracy,
    notes: audit.notes
  };

  // 4. Recursive Flattener for Nested Data (Farm or Business)
  const dataPayload = audit.type === 'farm' ? audit.farmData : audit.businessData;

  const recurse = (cur: any, prop: string) => {
    if (Object(cur) !== cur) {
      // Primitive value
      flat[prop] = cur;
    } else if (Array.isArray(cur)) {
      // Array handling
      if (cur.length === 0) {
        flat[prop] = '';
      } else if (typeof cur[0] === 'object') {
        // Array of objects (e.g., crops) -> JSON stringify to fit in one cell
        // Alternatively, specific critical fields could be extracted to separate columns
        flat[prop] = JSON.stringify(cur);
        
        // Extract key info for first 3 items for easier spreadsheet sorting
        if (prop.includes('crops')) {
            cur.slice(0, 3).forEach((item: any, i: number) => {
                flat['crop_' + (i + 1) + '_type'] = item.type;
                flat['crop_' + (i + 1) + '_yield'] = item.yieldLast;
            });
        }
      } else {
        // Array of strings -> Comma separated
        flat[prop] = cur.join(', ');
      }
    } else {
      // Nested Object
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        // Use snake_case for column headers
        const nextProp = prop ? `${ prop }_${ p } ` : p;
        recurse(cur[p], nextProp.replace(/[A-Z]/g, letter => `_${ letter.toLowerCase() } `));
      }
      if (isEmpty && prop) flat[prop] = '';
    }
  };

  if (dataPayload) {
    recurse(dataPayload, '');
  }

  // Explicitly ensure Final Notes are accessible at top level if nested logic missed them or for clarity
  if (audit.type === 'farm' && audit.farmData?.finalNotes) {
      flat['auditor_quality_score'] = audit.farmData.finalNotes.dataQuality;
      flat['audit_duration_mins'] = audit.farmData.finalNotes.duration;
      flat['auditor_observations'] = audit.farmData.finalNotes.observations;
  }

  // 5. AI Summary
  flat['ai_summary_report'] = audit.aiSummary || '';

  return flat;
};