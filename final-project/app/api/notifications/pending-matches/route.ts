import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

// GET: 取得待處理的配對請求（別人對我的配對請求）
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // 使用重試機制執行查詢
    const pendingMatches = await withRetry(async () => {
      return await prisma.match.findMany({
        where: {
          matchedUserId: authUser.id, // 我是被配對的對象
          status: 'pending',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              photos: {
                where: { isCover: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    return NextResponse.json({
      pendingMatches: pendingMatches.map((match) => ({
        id: match.id,
        fromUser: {
          id: match.user.id,
          name: match.user.name,
          photo: match.user.photos[0]?.url || null,
        },
        createdAt: match.createdAt.toISOString(),
      })),
      count: pendingMatches.length,
    });
  } catch (error: any) {
    console.error('Get pending matches error:', error);
    
    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}
