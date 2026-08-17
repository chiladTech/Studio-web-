import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'maya_pictures_super_secret_jwt_key_2026';
const TOKEN_COOKIE_NAME = 'maya_admin_token';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { role: true },
  });

  return user;
}

export async function requireAuth(requiredRole?: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (requiredRole && user.role.name !== requiredRole && user.role.name !== 'SYSTEM_ADMINISTRATOR') {
    throw new Error('Forbidden: Insufficient privileges');
  }

  return user;
}
