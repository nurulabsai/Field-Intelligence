import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generatePresignedUploadUrl, uploadToR2 } from '../services/r2Storage.js';
import { z } from 'zod';

const router = express.Router();

// Supported content types
const SUPPORTED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav'],
  video: ['video/webm', 'video/mp4', 'video/quicktime'],
  documents: ['application/pdf', 'application/json'],
};

const presignRequestSchema = z.object({
  fileName: z.string(),
  contentType: z.string().default('image/jpeg'),
  mediaType: z.enum(['image', 'audio', 'video', 'document']).optional(),
  auditId: z.string().optional(),
});

// POST /api/upload/presign - Get presigned URL for uploading
router.post('/presign', authenticate, async (req: AuthRequest, res) => {
  try {
    const { fileName, contentType, mediaType, auditId } = presignRequestSchema.parse(req.body);
    
    // Construct a more descriptive key path
    const folder = mediaType || 'misc';
    const prefix = auditId ? `audits/${auditId}/${folder}` : `uploads/${folder}`;
    const fullFileName = `${prefix}/${Date.now()}_${fileName}`;
    
    const result = await generatePresignedUploadUrl(fullFileName, contentType);
    
    res.json({
      ...result,
      mediaType: mediaType || 'unknown',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[Upload] Presign error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// POST /api/upload/voice-note - Special endpoint for voice notes
router.post('/voice-note', authenticate, async (req: AuthRequest, res) => {
  try {
    const { auditId, fieldId } = req.body;
    
    if (!auditId) {
      return res.status(400).json({ error: 'auditId is required' });
    }
    
    const fileName = `voice_${fieldId || 'note'}_${Date.now()}.webm`;
    const key = `audits/${auditId}/audio/${fileName}`;
    
    const result = await generatePresignedUploadUrl(key, 'audio/webm');
    
    res.json({
      ...result,
      mediaType: 'audio',
      fileName,
    });
  } catch (error) {
    console.error('[Upload] Voice note error:', error);
    res.status(500).json({ error: 'Failed to generate voice note upload URL' });
  }
});

// POST /api/upload/photo - Special endpoint for audit photos
router.post('/photo', authenticate, async (req: AuthRequest, res) => {
  try {
    const { auditId, label, contentType = 'image/jpeg' } = req.body;
    
    if (!auditId) {
      return res.status(400).json({ error: 'auditId is required' });
    }
    
    const safeLabel = (label || 'photo').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeLabel}_${Date.now()}.jpg`;
    const key = `audits/${auditId}/images/${fileName}`;
    
    const result = await generatePresignedUploadUrl(key, contentType);
    
    res.json({
      ...result,
      mediaType: 'image',
      fileName,
    });
  } catch (error) {
    console.error('[Upload] Photo error:', error);
    res.status(500).json({ error: 'Failed to generate photo upload URL' });
  }
});

// GET /api/upload/supported-types - List supported file types
router.get('/supported-types', (req, res) => {
  res.json(SUPPORTED_TYPES);
});

export default router;
