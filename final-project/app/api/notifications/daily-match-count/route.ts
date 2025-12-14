import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: 取得今日從貼文配對的數量
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // 計算今天已經從貼文配對的數量（matched 狀態）
    const todayMatchesFromPosts = await prisma.match.count({
      where: {
        userId: authUser.id,
        status: 'matched',
        matchedAt: {
          gte: today,
          lte: todayEnd,
        },
      },
    });

    return NextResponse.json({
      count: todayMatchesFromPosts,
      limit: 3,
      remaining: Math.max(0, 3 - todayMatchesFromPosts),
    });
  } catch (error) {
    console.error('Get daily match count error:', error);
    return NextResponse.json(
      { error: 'Failed to get daily match count' },
      { status: 500 }
    );
  }
}
