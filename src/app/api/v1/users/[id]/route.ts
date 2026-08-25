import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser, hashPassword, verifyPassword } from '@/lib/auth';
import { logActivity } from '@/lib/audit';

// PATCH /api/v1/users/[id] — Edit user details or change password
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isSelf = currentUser.id === params.id;
  const isSysAdmin = currentUser.role.name === 'SYSTEM_ADMINISTRATOR';

  // Only System Administrator or the user themselves can edit their profile
  if (!isSysAdmin && !isSelf) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to edit this account.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { fullName, email, username, roleName, password, currentPassword } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If a non-sysAdmin is changing their own password, verify current password
    if (password && isSelf && !isSysAdmin) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Please enter your current password to set a new password.' },
          { status: 400 }
        );
      }
      const isValid = await verifyPassword(currentPassword, targetUser.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
    }

    // Check unique email if changed
    if (email && email.toLowerCase() !== targetUser.email.toLowerCase()) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingEmail && existingEmail.id !== params.id) {
        return NextResponse.json({ error: 'Email address is already in use by another account.' }, { status: 400 });
      }
    }

    // Check unique username if changed
    if (username && username.toLowerCase() !== targetUser.username.toLowerCase()) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });
      if (existingUsername && existingUsername.id !== params.id) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 });
      }
    }

    const updateData: any = {};

    if (fullName) updateData.fullName = fullName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (username) updateData.username = username.toLowerCase().trim();

    // Password update
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(password);
    }

    // Role update (System Administrators can change OTHER users' roles, but cannot demote or alter their own role)
    if (roleName && isSysAdmin && !isSelf) {
      let role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        role = await prisma.role.create({
          data: {
            name: roleName,
            description: roleName === 'SYSTEM_ADMINISTRATOR' ? 'Full system administrator' : 'Content administrator',
          },
        });
      }
      updateData.roleId = role.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: { role: true },
    });

    // Write audit log
    const changedFields = Object.keys(updateData).filter((k) => k !== 'passwordHash').join(', ');
    const wasPasswordChanged = !!updateData.passwordHash;
    const logDetails = [
      changedFields ? `Fields changed: ${changedFields}` : '',
      wasPasswordChanged ? 'Password was reset' : '',
      isSelf ? '(self-edit)' : `(edited by ${currentUser.email})`,
    ].filter(Boolean).join(' | ');

    await logActivity({
      userId: currentUser.id,
      action: isSelf ? 'USER_SELF_UPDATE' : 'USER_UPDATE',
      resource: 'Users',
      details: `${updatedUser.fullName} (${updatedUser.email}) — ${logDetails}`,
    });

    return NextResponse.json({
      success: true,
      message: 'User account updated successfully.',
      data: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role.name,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/v1/users/[id] — Delete user
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

    await prisma.auditLog.deleteMany({
      where: { userId: params.id },
    });

    await prisma.user.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      action: 'USER_DELETE',
      resource: 'Users',
      details: `Deleted user: ${targetUser.fullName} (${targetUser.email}) — Role: ${targetUser.role.name}`,
    });

    return NextResponse.json({ success: true, message: `User ${targetUser.fullName} (${targetUser.email}) was deleted.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
