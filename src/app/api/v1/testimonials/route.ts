import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
  return NextResponse.json({ success: true, data: t }, { status: 201 });
}
