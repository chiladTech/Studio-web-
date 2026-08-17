import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { filename, originalName, mimeType, sizeBytes, url, altText } = body;

    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName: originalName || filename,
        mimeType: mimeType || 'image/jpeg',
        sizeBytes: sizeBytes || 1024,
        url,
        altText,
      },
    });

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record media asset' }, { status: 500 });
  }
}
