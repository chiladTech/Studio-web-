import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { media, ...projectData } = body;

    // Update main project fields
    const updated = await prisma.portfolioProject.update({
      where: { id: params.id },
      data: projectData,
    });

    // If media array was provided, recreate media entries
    if (Array.isArray(media)) {
      await prisma.portfolioMedia.deleteMany({
        where: { projectId: params.id },
      });

      for (let idx = 0; idx < media.length; idx++) {
        const item = media[idx];
        await prisma.portfolioMedia.create({
          data: {
            projectId: params.id,
            type: item.type || (item.src?.endsWith('.mp4') || item.src?.endsWith('.webm') ? 'video' : 'image'),
            src: item.src,
            caption: item.caption || updated.title,
            displayOrder: idx,
          },
        });
      }
    }

    const fullProject = await prisma.portfolioProject.findUnique({
      where: { id: params.id },
      include: { category: true, media: true },
    });

    return NextResponse.json({ success: true, data: fullProject });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.portfolioProject.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
