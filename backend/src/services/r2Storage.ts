import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

// Cloudflare R2 is S3-compatible
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export interface PresignedUploadUrl {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export const generatePresignedUploadUrl = async (
  fileNameOrKey: string,
  contentType: string = 'image/jpeg'
): Promise<PresignedUploadUrl> => {
  // If the key already includes a path (e.g., audits/123/images/photo.jpg), use it directly
  // Otherwise, generate a key with timestamp
  let key: string;
  if (fileNameOrKey.includes('/')) {
    key = fileNameOrKey;
  } else {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    key = `uploads/${timestamp}_${randomId}_${fileNameOrKey}`;
  }
  
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  
  // Generate presigned URL (valid for 15 minutes)
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
  
  // Public URL (accessible via R2 custom domain or public bucket)
  const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;
  
  return {
    uploadUrl,
    publicUrl,
    key,
  };
};

export const uploadToR2 = async (
  key: string,
  buffer: Buffer,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  await r2Client.send(command);
  
  return `${env.R2_PUBLIC_URL}/${key}`;
};

export const getDownloadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  
  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
};
