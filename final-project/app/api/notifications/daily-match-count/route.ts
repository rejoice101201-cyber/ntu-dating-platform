import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayInTaiwan } from '@/lib/dateUtils';

// 每日從貼文配對的限制（改為 5 人）
const DAILY_POST_MATCH_LIMIT = 5;

// GET: 取得今日從貼文配對的數量
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // 使用台灣時間計算今天
    const { start: today, end: todayEnd } = getTodayInTaiwan();

    // 計算今天已經從貼文配對的數量
    // 重要：只計算今天「創建」的匹配（createdAt 在今天），而不是今天「變成 matched」的匹配
    // 這樣可以確保只計算今天從貼文配對的匹配，而不會計算之前創建但今天才變成 matched 的匹配
    const todayMatchesFromPosts = await prisma.match.count({
      where: {
        userId: authUser.id,
        status: 'matched',
        // 只計算今天創建的匹配
        createdAt: {
          gte: today,
          lte: todayEnd,
        },
      },
    });

    return NextResponse.json({
      count: todayMatchesFromPosts,
      limit: DAILY_POST_MATCH_LIMIT,
      remaining: Math.max(0, DAILY_POST_MATCH_LIMIT - todayMatchesFromPosts),
    });
  } catch (error) {
    console.error('Get daily match count error:', error);
    return NextResponse.json(
      { error: 'Failed to get daily match count' },
      { status: 500 }
    );
  }
}
