/**
 * Image Compression Utility
 * Reduces image size for storage and API calls
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export async function compressImage(
  base64Image: string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels if needed
      let currentQuality = quality;
      let result = canvas.toDataURL('image/jpeg', currentQuality);

      // Reduce quality until size is acceptable
      while (getBase64SizeKB(result) > maxSizeKB && currentQuality > 0.1) {
        currentQuality -= 0.1;
        result = canvas.toDataURL('image/jpeg', currentQuality);
      }

      resolve(result);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64Image;
  });
}

function getBase64SizeKB(base64: string): number {
  const base64Length = base64.split(',')[1]?.length || 0;
  return (base64Length * 0.75) / 1024;
}

export function estimateImageSize(base64Image: string): number {
  return getBase64SizeKB(base64Image);
}
