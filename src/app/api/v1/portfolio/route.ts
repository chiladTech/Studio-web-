import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/v1/portfolio — Get all portfolio projects with category and media
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = { slug: category.toLowerCase() };
    }
    if (status) {
      where.status = status;
    }

    const projects = await prisma.portfolioProject.findMany({
      where,
      include: {
        category: true,
        media: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/v1/portfolio — Create a new project with media items (Admin protected)
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, categoryId, description, coverImage, isFeatured, status, media } = body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const project = await prisma.portfolioProject.create({
      data: {
        title,
        slug,
        categoryId,
        description,
        coverImage: coverImage || '/images/wedding-1.jpg',
        isFeatured: Boolean(isFeatured),
        status: status || 'PUBLISHED',
        media: {
          create: Array.isArray(media) ? media.map((item: any, idx: number) => ({
            type: item.type || (item.src?.endsWith('.mp4') || item.src?.endsWith('.webm') ? 'video' : 'image'),
            src: item.src,
            caption: item.caption || title,
            displayOrder: idx,
          })) : [
            {
              type: coverImage?.endsWith('.mp4') || coverImage?.endsWith('.webm') ? 'video' : 'image',
              src: coverImage || '/images/wedding-1.jpg',
              caption: title,
              displayOrder: 0,
            }
          ],
        },
      },
      include: {
        category: true,
        media: true,
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 400 });
  }
}
