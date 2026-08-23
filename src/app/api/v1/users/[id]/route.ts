import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only System Administrator can delete users
  if (user.role.name !== 'SYSTEM_ADMINISTRATOR') {
    return NextResponse.json({ error: 'Forbidden: Only System Administrators can delete users.' }, { status: 403 });
  }

  // Prevent deleting oneself
  if (user.id === params.id) {
    return NextResponse.json({ error: 'Cannot delete your own active administrator account.' }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete associated audit logs first if needed, or delete user directly
    await prisma.auditLog.deleteMany({
      where: { userId: params.id },
    });

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: `User ${targetUser.fullName} (${targetUser.email}) was deleted.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
