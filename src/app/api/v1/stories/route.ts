import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { revalidatePublicData } from '@/lib/revalidate';

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: stories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const story = await prisma.story.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage,
        author: body.author || 'Maya Pictures Studio',
        category: body.category || 'General',
        tags: body.tags,
        isPublished: body.isPublished ?? true,
      },
    });
    revalidatePublicData();

    return NextResponse.json({ success: true, data: story }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create story' }, { status: 500 });
  }
}
