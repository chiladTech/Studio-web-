import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

const DEFAULT_USER_PAGES = [
  '/admin',
  '/admin/stories',
  '/admin/testimonials',
  '/admin/faq',
  '/admin/portfolio',
  '/admin/categories',
  '/admin/media',
  '/admin/services',
  '/admin/packages',
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const settingKey = `user_permissions_${params.id}`;
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: settingKey },
    });

    let allowedPages = DEFAULT_USER_PAGES;
    if (setting && setting.value) {
      try {
        allowedPages = JSON.parse(setting.value);
      } catch {}
    }

    return NextResponse.json({ success: true, allowedPages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch user permissions' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only System Administrator can modify user permissions
  if (user.role.name !== 'SYSTEM_ADMINISTRATOR') {
    return NextResponse.json({ error: 'Forbidden: Only System Administrators can configure user permissions.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { allowedPages } = body;

    if (!Array.isArray(allowedPages)) {
      return NextResponse.json({ error: 'Invalid allowedPages array' }, { status: 400 });
    }

    const settingKey = `user_permissions_${params.id}`;
    await prisma.websiteSetting.upsert({
      where: { key: settingKey },
      update: { value: JSON.stringify(allowedPages) },
      create: { key: settingKey, value: JSON.stringify(allowedPages) },
    });

    return NextResponse.json({ success: true, allowedPages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user permissions' }, { status: 500 });
  }
}
