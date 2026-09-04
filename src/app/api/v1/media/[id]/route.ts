import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { deleteBlobAsset } from '@/lib/blob';
import { logActivity } from '@/lib/audit';
import { revalidatePublicData } from '@/lib/revalidate';

interface RouteParams {
  params: { id: string };
}

// GET /api/v1/media/[id]
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: params.id },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch asset' }, { status: 500 });
  }
}

// PATCH /api/v1/media/[id] — Update metadata
export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { altText, originalName } = body;

    const updated = await prisma.mediaAsset.update({
      where: { id: params.id },
      data: {
        altText: altText !== undefined ? altText : undefined,
        originalName: originalName !== undefined ? originalName : undefined,
      },
    });

    revalidatePublicData();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update asset' }, { status: 500 });
  }
}

// DELETE /api/v1/media/[id] — Delete asset from Blob and PostgreSQL
export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: params.id },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
    }

    // Check if the asset is currently referenced across active studio content
    const url = asset.url;
    const [projectCount, mediaCount, serviceCount, storyCount, categoryCount, settingCount, seoCount] =
      await Promise.all([
        prisma.portfolioProject.count({ where: { coverImage: url } }),
        prisma.portfolioMedia.count({ where: { src: url } }),
        prisma.service.count({ where: { coverImage: url } }),
        prisma.story.count({ where: { coverImage: url } }),
        prisma.portfolioCategory.count({ where: { coverImage: url } }),
        // Settings can hold media URLs (e.g. hero_video_url) — deleting those breaks live pages
        prisma.websiteSetting.count({ where: { value: url } }),
        // SEO og:image fields may reference Blob assets too
        prisma.sEOSetting.count({ where: { ogImage: url } }),
      ]);

    const totalReferences = projectCount + mediaCount + serviceCount + storyCount + categoryCount + settingCount + seoCount;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (totalReferences > 0 && !force) {
      return NextResponse.json(
        {
          error: `This media asset is currently used in ${totalReferences} place(s) across the website. Delete or replace those references first, or confirm force delete.`,
          referencedCount: totalReferences,
        },
        { status: 409 }
      );
    }

    // 1. Delete object from Vercel Blob (if it's a Vercel Blob URL)
    await deleteBlobAsset(url);

    // 2. Delete database record
    await prisma.mediaAsset.delete({
      where: { id: params.id },
    });

    // 3. Log audit event
    await logActivity({
      userId: user.id,
      action: 'DELETE_MEDIA',
      resource: 'MediaAsset',
      details: `Deleted media asset "${asset.originalName}" (${url})`,
    });

    revalidatePublicData();

    return NextResponse.json({
      success: true,
      message: `Media asset "${asset.originalName}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting media asset:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete asset' }, { status: 500 });
  }
}
