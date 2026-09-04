import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { revalidatePublicData } from '@/lib/revalidate';

// GET /api/v1/media — Retrieve media assets with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'image' | 'video'

    const where: any = {};
    if (type === 'image') {
      where.mimeType = { startsWith: 'image/' };
    } else if (type === 'video') {
      where.mimeType = { startsWith: 'video/' };
    }

    const assets = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}

// POST /api/v1/media — Register media metadata after direct Blob upload (Admin protected)
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { filename, originalName, mimeType, sizeBytes, url, altText } = body;

    if (!url) {
      return NextResponse.json({ error: 'Media URL is required' }, { status: 400 });
    }

    // STRICT ARCHITECTURAL RULE: Never store raw Base64 data URLs in PostgreSQL
    if (url.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Base64 data URLs are not permitted. Please upload media through the uploader instead.' },
        { status: 400 }
      );
    }

    // Check if asset already registered by URL
    const existing = await prisma.mediaAsset.findFirst({
      where: { url },
    });

    if (existing) {
      const updated = await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          originalName: originalName || existing.originalName,
          mimeType: mimeType || existing.mimeType,
          sizeBytes: sizeBytes !== undefined ? Number(sizeBytes) : existing.sizeBytes,
          altText: altText !== undefined ? altText : existing.altText,
        },
      });
      revalidatePublicData();
      return NextResponse.json({ success: true, data: updated });
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        filename: filename || url.split('/').pop() || 'asset',
        originalName: originalName || filename || 'Studio Media',
        mimeType: mimeType || 'image/jpeg',
        sizeBytes: Number(sizeBytes) || 0,
        url,
        altText: altText || originalName,
      },
    });

    revalidatePublicData();

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving media metadata:', error);
    return NextResponse.json({ error: error.message || 'Failed to record media asset' }, { status: 500 });
  }
}
