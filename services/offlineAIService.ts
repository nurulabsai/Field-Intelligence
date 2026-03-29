
import { getDB } from './db';
import { transcribeAudio, analyzeFieldPhoto } from './aiService';
import { saveAuditLocally, getAuditById } from './storageService';
import { draftService } from './draftService';

export interface AIRequest {
    id: string;
    type: 'transcribe' | 'analyze';
    dataBlob: Blob; // Audio or Image
    auditId: string; // The draft this belongs to
    fieldId: string; // The specific question/field
    context: any; // Extra data needed for processing
    createdAt: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

const STORE_NAME = 'ai_queue';

// 1. Queue a Request
export const queueAIRequest = async (
    type: 'transcribe' | 'analyze',
    dataBlob: Blob,
    auditId: string,
    fieldId: string,
    context: any
): Promise<void> => {
    const db = await getDB();
    const request: AIRequest = {
        id: crypto.randomUUID(),
        type,
        dataBlob,
        auditId,
        fieldId,
        context,
        createdAt: Date.now(),
        status: 'pending'
    };

    const tx = db.transaction([STORE_NAME], 'readwrite');
    await tx.objectStore(STORE_NAME).add(request);
};

// 2. Process the Queue (Called when online)
export const processAIQueue = async (): Promise<number> => {
    if (!navigator.onLine) return 0;

    const db = await getDB();
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);

    // Get all pending
    const allRequests: AIRequest[] = await new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
    });

    const pending = allRequests.filter(r => r.status === 'pending');
    if (pending.length === 0) return 0;

    let processedCount = 0;

    for (const req of pending) {
        try {
            // Mark as processing
            await updateRequestStatus(req.id, 'processing');

            // Execute AI Call
            let result: any = null;
            if (req.type === 'transcribe') {
                // Transcribe (assuming 'en' for now, or extract from context)
                const lang = req.context?.lang || 'en';
                result = await transcribeAudio(req.dataBlob, lang);
            } else if (req.type === 'analyze') {
                const base64 = await blobToBase64(req.dataBlob);
                result = await analyzeFieldPhoto(base64, req.context);
            }

            // Update the Draft Audit with the Result
            if (result) {
                await applyAIResultToAudit(req, result);
                await updateRequestStatus(req.id, 'completed');
                processedCount++;
            } else {
                await updateRequestStatus(req.id, 'failed'); // Retry later?
            }

        } catch (e) {
            await updateRequestStatus(req.id, 'failed');
        }
    }

    return processedCount;
};

// --- Helpers ---

const updateRequestStatus = async (id: string, status: AIRequest['status']) => {
    const db = await getDB();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = await new Promise<AIRequest>((resolve) => store.get(id).onsuccess = (e: any) => resolve(e.target.result));

    if (req) {
        req.status = status;
        store.put(req);
    }
};

const applyAIResultToAudit = async (req: AIRequest, result: any) => {

    // CASE 1: Handle IndexedDB Drafts (draft_templateId)
    if (req.auditId.startsWith('draft_')) {
        const templateId = req.auditId.replace('draft_', '');
        try {
            const draft = await draftService.get(templateId);
            if (draft?.formState) {
                const formState = draft.formState as Record<string, any>;

                if (req.type === 'transcribe') {
                    const currentVal = formState[req.fieldId] || '';
                    const cleanVal = String(currentVal)
                        .replace(' [Pending AI Processing... (Saved to Draft)]', '')
                        .replace(' [Offline: Voice note saved but not transcribed]', '')
                        .replace(' [Pending AI Processing...]', '');
                    const newVal = cleanVal ? `${cleanVal}\n\n[AI Transcribed]: ${result}` : result;
                    formState[req.fieldId] = newVal;
                } else if (req.type === 'analyze' && result.observations) {
                    const targetField = formState['auditor_observations'] !== undefined ? 'auditor_observations' : 'notes';
                    const currentNotes = formState[targetField] || '';
                    formState[targetField] = `${currentNotes}\n\n[AI Analysis]: ${result.observations}`;
                }

                await draftService.save(templateId, draft.templateName, formState);
                return;
            }
        } catch (e) {
            console.warn('[AI] Failed to apply to draft:', e);
        }
    }

    // CASE 2: Handle IndexedDB Audits
    const audit = await getAuditById(req.auditId);
    if (!audit) {
        return;
    }

    // Update logic depends on type
    if (req.type === 'transcribe') {
        // Append text to existing value or replace
        const currentVal = (audit as any)[req.fieldId] || '';
        // Remove the placeholder tag
        const cleanVal = String(currentVal).replace(' [Pending AI Processing... (Saved to Draft)]', '').replace(' [Offline: Voice note saved but not transcribed]', '');
        const newVal = cleanVal ? `${cleanVal}\n\n[AI Transcribed]: ${result}` : result;

        // Naively update top-level property. 
        // NOTE: If field is nested (e.g. farmData.notes), we need deeper merging.
        // For this prototype, we'll try to update both top-level and farmData if exists.
        (audit as any)[req.fieldId] = newVal;
        if (audit.farmData) (audit.farmData as any)[req.fieldId] = newVal;
        if (audit.businessData) (audit.businessData as any)[req.fieldId] = newVal;

    } else if (req.type === 'analyze') {
        // For image analysis, we might want to attach a note or auto-fill fields
        // result is PhotoAnalysis object
        if (result.observations) {
            const current = audit.notes || '';
            audit.notes = `${current}\n\n[AI Image Analysis]: ${result.observations}`;
        }
        // TODO: Implement advanced autofill based on result.autoFillSuggestions
    }

    await saveAuditLocally(audit);
};

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // preserve the type header? aiService expects base64 string, sometimes with header
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
