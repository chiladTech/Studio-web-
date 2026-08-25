import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename
    const originalName = file.name || 'uploaded_media';
    const ext = path.extname(originalName) || '.jpg';
    const sanitizeName = path.basename(originalName, ext).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${sanitizeName}_${Date.now()}${ext}`;

    let publicUrl = `/images/${filename}`;

    try {
      // 1. Try local filesystem write (Standard Node / Local development)
      const uploadDir = path.join(process.cwd(), 'public', 'images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);
    } catch (fsErr) {
      // 2. Serverless fallback (e.g. Vercel read-only filesystem)
      console.warn('Filesystem write not allowed on this environment. Storing media as base64 Data URI fallback.');
      const mime = file.type || 'image/jpeg';
      publicUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    }

    // Record asset in database
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName,
        mimeType: file.type || 'image/jpeg',
        sizeBytes: file.size,
        url: publicUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        asset,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
