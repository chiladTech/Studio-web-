import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Allow large video file uploads (up to 200MB)
export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minute timeout for large uploads

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // File size guard: reject files over 200MB
    const MAX_SIZE_BYTES = 200 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum allowed size is 200MB.' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Detect if it's a video or image
    const mimeType = file.type || 'application/octet-stream';
    const isVideo = mimeType.startsWith('video/');

    // Clean filename — preserve safe ASCII chars and replace everything else with underscore
    const originalName = file.name || 'uploaded_media';
    const ext = path.extname(originalName) || (isVideo ? '.mp4' : '.jpg');
    const basename = path.basename(originalName, ext);

    // Safe sanitize: replace any char that isn't a-z, A-Z, 0-9, dash, underscore with underscore
    // Also handle Unicode/Amharic filenames by replacing entirely if empty after sanitize
    const sanitized = basename.replace(/[^a-zA-Z0-9\-_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    const safeName = sanitized || 'media';
    const filename = `${safeName}_${Date.now()}${ext}`;

    // Use /videos/ subfolder for video files, /images/ for everything else
    const subFolder = isVideo ? 'videos' : 'images';
    let publicUrl = `/${subFolder}/${filename}`;

    try {
      // 1. Try local filesystem write (Standard Node / Local development)
      const uploadDir = path.join(process.cwd(), 'public', subFolder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);
    } catch (fsErr) {
      // 2. Serverless fallback (e.g. Vercel read-only filesystem)
      console.warn('Filesystem write not allowed. Storing media as base64 Data URI fallback.');
      publicUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    // Record asset in database
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName,
        mimeType,
        sizeBytes: file.size,
        url: publicUrl,
        altText: isVideo ? 'Video asset' : undefined,
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
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
