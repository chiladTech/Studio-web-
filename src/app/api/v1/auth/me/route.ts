import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let allowedPages: string[] | null = null;
    if (user.role.name === 'CONTENT_ADMINISTRATOR') {
      // 1. Check user-specific permissions first
      const userSpecificSetting = await prisma.websiteSetting.findUnique({
        where: { key: `user_permissions_${user.id}` },
      });

      if (userSpecificSetting && userSpecificSetting.value) {
        try {
          allowedPages = JSON.parse(userSpecificSetting.value);
        } catch {}
      }

      // 2. Fallback to global role setting if not configured individually
      if (!allowedPages) {
        const roleSetting = await prisma.websiteSetting.findUnique({
          where: { key: 'contentAdminAllowedPages' },
        });
        if (roleSetting && roleSetting.value) {
          try {
            allowedPages = JSON.parse(roleSetting.value);
          } catch {}
        }
      }

      // 3. Fallback to defaults
      if (!allowedPages) {
        allowedPages = DEFAULT_USER_PAGES;
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleName: user.role.name,
        isSystemAdmin: user.role.name === 'SYSTEM_ADMINISTRATOR',
        allowedPages,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
