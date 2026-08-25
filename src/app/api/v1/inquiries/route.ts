import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { InquirySchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { sendInquiryNotifications } from '@/lib/email';

// GET /api/v1/inquiries — Fetch all inquiries (Admin protected)
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: inquiries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/v1/inquiries — Create new public booking inquiry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = InquirySchema.parse(body);

    const count = await prisma.inquiry.count();
    const inquiryNumber = `MP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const inquiry = await prisma.inquiry.create({
      data: {
        inquiryNumber,
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        contactMethod: validated.contactMethod,
        service: validated.service,
        package: validated.package,
        preferredDate: validated.preferredDate,
        alternativeDate: validated.alternativeDate,
        location: validated.location,
        expectedGuests: validated.expectedGuests,
        budget: validated.budget,
        message: validated.message,
        status: 'NEW',
      },
    });

    // Send asynchronous transactional emails without blocking client response
    sendInquiryNotifications({
      inquiryNumber: inquiry.inquiryNumber,
      fullName: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone,
      service: inquiry.service,
      package: inquiry.package,
      preferredDate: inquiry.preferredDate,
      location: inquiry.location,
      budget: inquiry.budget,
      message: inquiry.message,
      contactMethod: inquiry.contactMethod,
    }).catch((e) => console.error('Background email notification error:', e));

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit inquiry' }, { status: 400 });
  }
}
