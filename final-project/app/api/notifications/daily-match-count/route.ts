import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayInTaiwan } from '@/lib/dateUtils';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

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

    // 使用重試機制執行查詢
    // 計算所有從貼文發起的配對請求（包括 pending 和 matched）
    const todayMatchesFromPosts = await withRetry(async () => {
      return await prisma.match.count({
        where: {
          userId: authUser.id,
          status: {
            in: ['matched', 'pending'], // 包含 pending 和 matched 狀態
          },
          // 只計算今天創建的匹配
          createdAt: {
            gte: today,
            lte: todayEnd,
          },
        },
      });
    });

    const DAILY_POST_MATCH_LIMIT = 5;

    return NextResponse.json({
      count: todayMatchesFromPosts,
      limit: DAILY_POST_MATCH_LIMIT,
      remaining: Math.max(0, DAILY_POST_MATCH_LIMIT - todayMatchesFromPosts),
    });
  } catch (error: any) {
    console.error('Get daily match count error:', error);
    
    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}
