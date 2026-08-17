import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const service = await prisma.service.create({
      data: {
        name: body.name,
        slug: (body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) + '-' + Math.floor(Math.random() * 1000),
        shortDesc: body.shortDesc,
        longDesc: body.longDesc,
        icon: body.icon,
        coverImage: body.coverImage,
        features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
        isPublished: body.isPublished ?? true,
      },
    });
    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create service' }, { status: 500 });
  }
}
