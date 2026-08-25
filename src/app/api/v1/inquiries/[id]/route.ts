import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { logActivity } from '@/lib/audit';

// PATCH /api/v1/inquiries/[id] — Update inquiry status or internal notes
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, internalNotes } = body;

    const updated = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
    });

    // Audit log
    if (status) {
      await logActivity({
        userId: user.id,
        action: 'INQUIRY_STATUS_CHANGE',
        resource: 'Inquiries',
        details: `#${updated.inquiryNumber} (${updated.fullName}) — Status changed to: ${status}`,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update inquiry' }, { status: 400 });
  }
}

