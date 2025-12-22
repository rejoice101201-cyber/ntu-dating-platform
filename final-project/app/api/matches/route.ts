import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // 使用重試機制執行查詢 - 包含 matched 和 pending 狀態
    const matches = await withRetry(async () => {
      return await prisma.match.findMany({
        where: {
          OR: [
            { userId: authUser.id },
            { matchedUserId: authUser.id },
          ],
          status: {
            in: ['matched', 'pending'],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              photos: {
                // 返回所有 photos，不只是 cover
                orderBy: { order: 'asc' },
              },
            },
          },
          matchedUser: {
            select: {
              id: true,
              name: true,
              photos: {
                // 返回所有 photos，不只是 cover
                orderBy: { order: 'asc' },
              },
            },
          },
          messages: {
            select: {
              createdAt: true,
              content: true, // 也返回 content，前端需要
            },
            orderBy: {
              createdAt: 'desc' as const,
            },
            take: 1,
          },
        },
      });
    });

    // Format matches to always show the other user
    // 先收集所有需要查询的 targetUserId
    const targetUserIds = matches.map((match: any) => {
      const otherUser = match.userId === authUser.id ? match.matchedUser : match.user;
      return otherUser.id;
    }).filter(Boolean) as string[];

    // 一次性批量查询所有 unlockProgress（只查询一次！）
    const unlockProgresses = targetUserIds.length > 0 ? await withRetry(async () => {
      return await prisma.unlockProgress.findMany({
        where: {
          userId: authUser.id,
          targetUserId: { in: targetUserIds },
        },
      });
    }) : [];

    // 创建 Map 用于快速查找
    const unlockMap = new Map(
      unlockProgresses.map(up => [`${up.userId}-${up.targetUserId}`, up])
    );

    // Map unlock level to blur stages: 0% → 20px, 10% → 15px, 30% → 10px, 50% → 5px, 100% → 0px
    // Using smaller blur values to maintain color visibility
    const getBlurLevel = (unlockLevel: number): number => {
      if (unlockLevel >= 100) return 0;
      if (unlockLevel >= 50) return 5;
      if (unlockLevel >= 30) return 10;
      if (unlockLevel >= 10) return 15;
      return 20; // 0-10% - initial blur, still shows color
    };

    // 现在使用 Map 查找，而不是查询数据库
    const formattedMatches = matches.map((match: any) => {
      const otherUser = match.userId === authUser.id ? match.matchedUser : match.user;
      
      // 判断配對請求的方向
      const isPending = match.status === 'pending';
      const isSentByMe = match.userId === authUser.id; // 我發送的配對請求
      const isReceivedByMe = match.matchedUserId === authUser.id; // 別人發送給我的配對請求
      
      // 从 Map 中查找，而不是查询数据库
      const unlockProgress = unlockMap.get(`${authUser.id}-${otherUser.id}`);

      const photosWithBlur = (otherUser.photos || []).map((photo: any) => {
        const progress = unlockProgress?.unlockLevel || 0;
        const effectiveBlur = getBlurLevel(progress);
        return {
          ...photo,
          blurLevel: effectiveBlur,
        };
      });

      const lastMessage = match.messages?.[0];
      
      return {
        id: match.id,
        status: match.status, // 'matched' 或 'pending'
        isPending,
        isSentByMe, // 是否是我發送的配對請求
        isReceivedByMe, // 是否是別人發送給我的配對請求
        user: {
          id: otherUser.id,
          name: otherUser.name,
          photos: photosWithBlur,
        },
        unlockProgress: unlockProgress ? {
          unlockLevel: unlockProgress.unlockLevel,
          qaCompleted: unlockProgress.qaCompleted,
        } : null,
        createdAt: match.createdAt,
        matchedAt: match.matchedAt,
        lastMessageAt: lastMessage?.createdAt || match.matchedAt,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt.toISOString(),
        } : null,
      };
    });

    // 排序：先按狀態（pending 在前，matched 在後），再按時間
    formattedMatches.sort((a: any, b: any) => {
      // pending 狀態優先顯示
      if (a.isPending && !b.isPending) return -1;
      if (!a.isPending && b.isPending) return 1;
      
      // 相同狀態下，按最後消息時間排序（最新的在最上面）
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime; // 降序排列
    });

    console.log('Formatted matches:', formattedMatches.map((m: any) => ({
      id: m.id,
      userName: m.user.name,
      photosCount: m.user.photos?.length || 0,
      lastMessageAt: m.lastMessageAt,
    })));

    return NextResponse.json({ matches: formattedMatches });
  } catch (error: any) {
    console.error('Get matches error:', error);
    
    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}

