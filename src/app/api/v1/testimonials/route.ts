import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePublicData } from '@/lib/revalidate';

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: 'asc' },
  });
  return NextResponse.json({ success: true, data: testimonials });
}

export async function POST(request: Request) {
  const body = await request.json();
  const t = await prisma.testimonial.create({ data: body });
  revalidatePublicData();
  return NextResponse.json({ success: true, data: t }, { status: 201 });
}
