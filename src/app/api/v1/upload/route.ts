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

    const uploadDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/images/${filename}`;

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

    return NextResponse.json({
      success: true,
      url: publicUrl,
      asset,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
