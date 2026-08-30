import { del, head, list } from '@vercel/blob';

// Supported MIME types and extensions
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/ogg',
];

export const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// File size limits in bytes
export const MAX_IMAGE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB
export const MAX_VIDEO_SIZE_BYTES = 250 * 1024 * 1024; // 250 MB

/**
 * Checks if a given MIME type is a video
 */
export function isVideoMimeType(mimeType: string): boolean {
  return mimeType.startsWith('video/') || ALLOWED_VIDEO_TYPES.includes(mimeType);
}

/**
 * Validates a file's MIME type and size against studio thresholds
 */
export function validateMediaFile(file: { type: string; size: number; name?: string }) {
  const mimeType = file.type || '';
  const isVideo = isVideoMimeType(mimeType);
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType) || mimeType.startsWith('image/');

  if (!isImage && !isVideo) {
    throw new Error(
      `Unsupported file type (${mimeType || 'unknown'}). Allowed: JPEG, PNG, WebP, AVIF, SVG, MP4, WebM, MOV.`
    );
  }

  const maxBytes = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxBytes) {
    const maxMB = Math.round(maxBytes / (1024 * 1024));
    throw new Error(
      `File size exceeds maximum limit of ${maxMB} MB (Current: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`
    );
  }

  return { isValid: true, isVideo };
}

/**
 * Generates a clean, collision-resistant Blob pathname
 * Example output: maya-pictures/portfolio/wedding-moment-1787691234-a1b2.jpg
 */
export function generateSafeBlobPath(originalName: string, category: string = 'general'): string {
  const safeCategory = category.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'general';
  
  // Extract extension and basename
  const lastDotIndex = originalName.lastIndexOf('.');
  const ext = lastDotIndex !== -1 ? originalName.slice(lastDotIndex).toLowerCase() : '';
  const rawBase = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;

  // Sanitize base name to safe alphanumeric with dashes
  const safeBase = rawBase
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'asset';

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);

  return `maya-pictures/${safeCategory}/${safeBase}-${timestamp}-${randomSuffix}${ext}`;
}

/**
 * Safely deletes an asset from Vercel Blob if the URL is hosted on Vercel Blob
 */
export async function deleteBlobAsset(url: string): Promise<boolean> {
  if (!url) return false;

  // Check if it's a Vercel Blob URL (matches *.public.blob.vercel-storage.com or contains blob.vercel-storage)
  const isBlobUrl = url.includes('blob.vercel-storage.com');
  if (!isBlobUrl) {
    // Local asset or third-party URL — no Vercel Blob deletion needed
    return false;
  }

  try {
    await del(url);
    return true;
  } catch (error) {
    console.error(`Failed to delete Vercel Blob asset at ${url}:`, error);
    return false;
  }
}
