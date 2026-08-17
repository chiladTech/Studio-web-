import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const pkg = await prisma.package.create({
      data: {
        name: body.name,
        slug: (body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) + '-' + Math.floor(Math.random() * 1000),
        priceDisplay: body.priceDisplay,
        minPrice: body.minPrice ? parseFloat(body.minPrice) : null,
        maxPrice: body.maxPrice ? parseFloat(body.maxPrice) : null,
        currency: body.currency || 'ETB',
        description: body.description,
        duration: body.duration,
        deliverables: typeof body.deliverables === 'string' ? body.deliverables : JSON.stringify(body.deliverables || []),
        isFeatured: body.isFeatured ?? false,
        isPublished: body.isPublished ?? true,
      },
    });
    return NextResponse.json({ success: true, data: pkg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create package' }, { status: 500 });
  }
}
