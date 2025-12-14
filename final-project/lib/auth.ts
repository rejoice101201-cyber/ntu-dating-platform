import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isVerified: boolean;
}

/**
 * 從 request header 讀取 Bearer token 並取得使用者
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const token = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * 驗證 request 是否登入；未登入回傳 401 Response
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthUser } | Response> {
  const user = await getAuthUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return { user };
}

