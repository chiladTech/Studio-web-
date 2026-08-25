import { prisma } from './db';

export async function logActivity({
  userId,
  action,
  resource,
  details,
}: {
  userId?: string | null;
  action: string; // e.g. 'USER_UPDATE', 'PACKAGE_UPDATE', 'INQUIRY_STATUS_CHANGE', 'SETTINGS_UPDATE'
  resource: string; // e.g. 'Users', 'Packages', 'Inquiries', 'Settings'
  details?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        resource,
        details: details || '',
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
    return null;
  }
}
