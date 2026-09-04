import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { revalidatePublicData } from '@/lib/revalidate';
import { logActivity } from '@/lib/audit';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const updated = await prisma.package.update({
      where: { id: params.id },
      data: body,
    });

    await logActivity({
      userId: user.id,
      action: 'PACKAGE_UPDATE',
      resource: 'Packages',
      details: `Updated package: "${updated.name}" — Price: ${updated.priceDisplay}`,
    });

    revalidatePublicData();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const pkg = await prisma.package.findUnique({ where: { id: params.id } });
    await prisma.package.delete({ where: { id: params.id } });

    await logActivity({
      userId: user.id,
      action: 'PACKAGE_DELETE',
      resource: 'Packages',
      details: `Deleted package: "${pkg?.name || params.id}"`,
    });

    revalidatePublicData();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete package' }, { status: 500 });
  }
}

