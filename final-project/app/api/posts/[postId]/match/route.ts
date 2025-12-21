import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayInTaiwan } from '@/lib/dateUtils';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

// POST: 從貼文配對（點擊「想要配對」按鈕）
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { postId } = params;

  try {
    // 使用重試機制取得貼文資訊
    const post = await withRetry(async () => {
      return await prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          authorId: true,
        },
      });
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // 不能配對自己
    if (post.authorId === authUser.id) {
      return NextResponse.json(
        { error: 'Cannot match with yourself' },
        { status: 400 }
      );
    }

    // Phase 4: 檢查今日從貼文配對的數量（限制 5 個）
    // 使用台灣時間計算今天
    const { start: today, end: todayEnd } = getTodayInTaiwan();

    // 使用重試機制執行查詢
    // 只計算今天創建的匹配（createdAt 在今天）
    const todayMatchesFromPosts = await withRetry(async () => {
      return await prisma.match.count({
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
    });

    const DAILY_POST_MATCH_LIMIT = 5;

    // 如果今天已經配對 5 個，拒絕新的配對請求
    if (todayMatchesFromPosts >= DAILY_POST_MATCH_LIMIT) {
      return NextResponse.json(
        { 
          error: '今日配對上限已達',
          message: `每天最多只能從貼文中配對 ${DAILY_POST_MATCH_LIMIT} 個人`,
          limitReached: true,
        },
        { status: 429 }
      );
    }

    // 使用重試機制檢查是否已經有 Match 記錄
    const existingMatch = await withRetry(async () => {
      return await prisma.match.findFirst({
        where: {
          OR: [
            {
              userId: authUser.id,
              matchedUserId: post.authorId,
            },
            {
              userId: post.authorId,
              matchedUserId: authUser.id,
            },
          ],
        },
      });
    });

    if (existingMatch) {
      // 如果已經配對，直接回傳
      if (existingMatch.status === 'matched') {
        return NextResponse.json({
          match: {
            id: existingMatch.id,
            status: existingMatch.status,
            alreadyMatched: true,
          },
        });
      }
      
      // 如果是 pending，檢查是否雙向都發起了配對請求
      // 這裡簡化處理：如果對方也發起了，就變成 matched
      if (existingMatch.status === 'pending') {
        // 使用重試機制檢查是否有反向的 pending match
        const reverseMatch = await withRetry(async () => {
          return await prisma.match.findFirst({
            where: {
              userId: post.authorId,
              matchedUserId: authUser.id,
              status: 'pending',
            },
          });
        });

        if (reverseMatch) {
          // 雙方都發起了配對，更新為 matched（使用重試機制）
          const updatedMatch = await withRetry(async () => {
            return await prisma.match.update({
              where: { id: existingMatch.id },
              data: {
                status: 'matched',
                matchedAt: new Date(),
              },
            });
          });

          // 刪除反向的 pending match（避免重複）
          await withRetry(async () => {
            return await prisma.match.delete({
              where: { id: reverseMatch.id },
            });
          }).catch(() => {
            // 忽略刪除錯誤
          });

          return NextResponse.json({
            match: {
              id: updatedMatch.id,
              status: updatedMatch.status,
              matched: true,
            },
          });
        }
      }

      return NextResponse.json({
        match: {
          id: existingMatch.id,
          status: existingMatch.status,
          pending: true,
        },
      });
    }

    // 使用重試機制建立新的 pending match
    const newMatch = await withRetry(async () => {
      return await prisma.match.create({
        data: {
          userId: authUser.id,
          matchedUserId: post.authorId,
          status: 'pending',
        },
      });
    });

    // 使用重試機制檢查對方是否也發起了配對請求
    const reverseMatch = await withRetry(async () => {
      return await prisma.match.findFirst({
        where: {
          userId: post.authorId,
          matchedUserId: authUser.id,
          status: 'pending',
        },
      });
    });

    if (reverseMatch) {
      // 雙方都發起了配對，更新為 matched（使用重試機制）
      const updatedMatch = await withRetry(async () => {
        return await prisma.match.update({
          where: { id: newMatch.id },
          data: {
            status: 'matched',
            matchedAt: new Date(),
          },
        });
      });

      // 刪除反向的 pending match（使用重試機制）
      await withRetry(async () => {
        return await prisma.match.delete({
          where: { id: reverseMatch.id },
        });
      }).catch(() => {
        // 忽略刪除錯誤
      });

      return NextResponse.json({
        match: {
          id: updatedMatch.id,
          status: updatedMatch.status,
          matched: true,
        },
      });
    }

    return NextResponse.json({
      match: {
        id: newMatch.id,
        status: newMatch.status,
        pending: true,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Match from post error:', error);
    
    // 處理唯一約束錯誤
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Match already exists' },
        { status: 409 }
      );
    }

    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}
