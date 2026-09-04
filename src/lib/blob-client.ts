import { upload } from '@vercel/blob/client';
import { validateMediaFile, generateSafeBlobPath } from './blob';

export interface UploadOptions {
  category?: 'portfolio' | 'gallery' | 'services' | 'hero' | 'stories' | 'logo' | 'general';
  altText?: string;
  onProgress?: (percentage: number) => void;
}

export interface UploadResult {
  url: string;
  pathname: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isVideo: boolean;
  assetId?: string;
}

/**
 * Uploads a file directly from the browser to Vercel Blob via authorized token endpoint,
 * then registers the media asset metadata in PostgreSQL.
 */
export async function uploadMediaDirect(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { category = 'general', altText, onProgress } = options;

  // 1. Client-side pre-validation
  const { isVideo } = validateMediaFile({
    type: file.type,
    size: file.size,
    name: file.name,
  });

  const safePathname = generateSafeBlobPath(file.name, category);

  // 2. Direct browser-to-Vercel-Blob upload
  const blob = await upload(safePathname, file, {
    access: 'public',
    handleUploadUrl: '/api/v1/blob/upload',
    clientPayload: JSON.stringify({
      originalName: file.name,
      category,
      altText,
      sizeBytes: file.size,
      mimeType: file.type,
    }),
    onUploadProgress: (progress) => {
      if (onProgress) {
        onProgress(Math.round(progress.percentage));
      }
    },
  });

  // 3. Register media asset record in database
  let assetId: string | undefined;
  try {
    const regRes = await fetch('/api/v1/media', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: safePathname,
        originalName: file.name,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        sizeBytes: file.size,
        url: blob.url,
        altText: altText || file.name,
      }),
    });

    if (regRes.ok) {
      const regData = await regRes.json();
      assetId = regData.data?.id;
    }
  } catch (err) {
    console.warn('Warning: Could not register MediaAsset record after Blob upload:', err);
  }

  return {
    url: blob.url,
    pathname: blob.pathname,
    filename: safePathname,
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    isVideo,
    assetId,
  };
}
