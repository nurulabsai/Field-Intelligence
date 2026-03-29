import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { appendToSheet, batchAppendToSheet, AuditRow } from '../services/googleSheets.js';
import { mapApiAuditToFarmPayload, supabaseFarmAuditService } from '../services/supabaseFarmAudit.js';
import { isSupabaseConfigured } from '../config/env.js';
import { z } from 'zod';

const router = express.Router();

const auditSchema = z.object({
  id: z.string(),
  type: z.enum(['farm', 'business']),
  businessName: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
    timestamp: z.number().optional(),
  }).optional(),
  status: z.string(),
  farmData: z.any().optional(),
  businessData: z.any().optional(),
});

// POST /api/audits/sync
router.post('/sync', authenticate, async (req: AuthRequest, res) => {
  try {
    const audit = auditSchema.parse(req.body);

    // Farm audits with boundary_corners -> Supabase first
    const farmPayload = mapApiAuditToFarmPayload(audit);
    if (farmPayload && isSupabaseConfigured()) {
      try {
        const result = await supabaseFarmAuditService.create(farmPayload);
        if (result?.audit_id) {
          return res.json({
            success: true,
            message: 'Audit synced to Supabase',
            audit_id: result.audit_id,
          });
        }
      } catch (supabaseError) {
        console.warn('[Audits] Supabase failed, falling back to Google Sheets:', supabaseError);
      }
    }

    // Fallback: Google Sheets (farm without valid payload, business, or Supabase failure)
    const auditRow = {
      auditId: audit.id,
      auditType: audit.type,
      businessName: audit.businessName,
      auditorName: req.user?.email || 'Unknown',
      auditDate: new Date().toISOString(),
      location: audit.location ? `${audit.location.latitude}, ${audit.location.longitude}` : '',
      latitude: audit.location?.latitude,
      longitude: audit.location?.longitude,
      status: audit.status,
      ...(audit.type === 'farm' ? audit.farmData : audit.businessData),
    };

    await appendToSheet(auditRow);

    res.json({ success: true, message: 'Audit synced to Google Sheets' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid audit data', details: error.errors });
    }
    console.error('[Audits] Sync error:', error);
    res.status(500).json({ error: 'Failed to sync audit' });
  }
});

// POST /api/audits/batch-sync
router.post('/batch-sync', authenticate, async (req: AuthRequest, res) => {
  try {
    const audits = z.array(auditSchema).parse(req.body);
    const googleSheetsRows: AuditRow[] = [];
    let supabaseCount = 0;

    const auditRows = audits.map((audit) => ({
      auditId: audit.id,
      auditType: audit.type,
      businessName: audit.businessName,
      auditorName: req.user?.email || 'Unknown',
      auditDate: new Date().toISOString(),
      location: audit.location ? `${audit.location.latitude}, ${audit.location.longitude}` : '',
      latitude: audit.location?.latitude,
      longitude: audit.location?.longitude,
      status: audit.status,
      ...(audit.type === 'farm' ? audit.farmData : audit.businessData),
    }));

    // Farm audits with valid payload -> Supabase; others -> Google Sheets
    for (let i = 0; i < audits.length; i++) {
      const audit = audits[i];
      const farmPayload = mapApiAuditToFarmPayload(audit);
      if (farmPayload && isSupabaseConfigured()) {
        try {
          const result = await supabaseFarmAuditService.create(farmPayload);
          if (result?.audit_id) {
            supabaseCount++;
            continue;
          }
        } catch (supabaseError) {
          console.warn(`[Audits] Supabase failed for audit ${audit.id}, using Google Sheets:`, supabaseError);
        }
      }
      googleSheetsRows.push(auditRows[i]);
    }

    if (googleSheetsRows.length > 0) {
      await batchAppendToSheet(googleSheetsRows);
    }

    const messages: string[] = [];
    if (supabaseCount > 0) messages.push(`${supabaseCount} to Supabase`);
    if (googleSheetsRows.length > 0) messages.push(`${googleSheetsRows.length} to Google Sheets`);

    res.json({
      success: true,
      message: `${audits.length} audits synced (${messages.join(', ')})`,
      supabase_count: supabaseCount,
      google_sheets_count: googleSheetsRows.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid audit data', details: error.errors });
    }
    console.error('[Audits] Batch sync error:', error);
    res.status(500).json({ error: 'Failed to batch sync audits' });
  }
});

export default router;
