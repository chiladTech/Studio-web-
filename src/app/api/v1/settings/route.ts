import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.websiteSetting.findMany();
    const map: Record<string, any> = {};
    settings.forEach((s) => {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    });
    return NextResponse.json({ success: true, data: map });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const updates = Object.entries(body);

    for (const [key, val] of updates) {
      const valueStr = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      await prisma.websiteSetting.upsert({
        where: { key },
        update: { value: valueStr },
        create: { key, value: valueStr },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
