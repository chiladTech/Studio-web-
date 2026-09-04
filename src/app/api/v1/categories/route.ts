import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { revalidatePublicData } from '@/lib/revalidate';

export async function GET() {
  try {
    const categories = await prisma.portfolioCategory.findMany({
      include: {
        _count: { select: { projects: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, slug, description, coverImage } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await prisma.portfolioCategory.create({
      data: {
        name,
        slug,
        description,
        coverImage,
      },
    });

    revalidatePublicData();

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
