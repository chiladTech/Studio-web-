import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { generateSafeBlobPath, validateMediaFile } from '@/lib/blob';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Legacy/fallback upload route.
 * Note: For production and large media (>4.5MB), use direct client upload via /api/v1/blob/upload.
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type and size
    const { isVideo } = validateMediaFile({
      type: file.type,
      size: file.size,
      name: file.name,
    });

    const safePath = generateSafeBlobPath(file.name, category);
    let publicUrl: string;

    // 1. Primary: Upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(safePath, file, {
        access: 'public',
        contentType: file.type,
      });
      publicUrl = blob.url;
    } else if (process.env.NODE_ENV === 'development') {
      // Local development fallback when running offline without Vercel token
      const subFolder = isVideo ? 'videos' : 'images';
      const uploadDir = path.join(process.cwd(), 'public', subFolder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = path.basename(safePath);
      const filePath = path.join(uploadDir, filename);
      const bytes = await file.arrayBuffer();
      await fs.promises.writeFile(filePath, Buffer.from(bytes));
      publicUrl = `/${subFolder}/${filename}`;
    } else {
      return NextResponse.json(
        {
          error: 'Vercel Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN.',
        },
        { status: 500 }
      );
    }

    // 2. Persist MediaAsset metadata in PostgreSQL
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: safePath,
        originalName: file.name,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        sizeBytes: file.size,
        url: publicUrl,
        altText: file.name,
      },
    });

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        asset,
        isVideo,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process media upload.' },
      { status: 500 }
    );
  }
}
