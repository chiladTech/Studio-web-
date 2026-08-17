import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const faq = await prisma.fAQ.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category || 'General',
        isPublished: body.isPublished ?? true,
      },
    });
    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create FAQ' }, { status: 500 });
  }
}
