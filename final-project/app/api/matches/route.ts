import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userId: authUser.id },
          { matchedUserId: authUser.id },
        ],
        status: 'matched',
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
        matchedUser: {
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

    // Format matches to always show the other user
    const formattedMatches = await Promise.all(matches.map(async (match: any) => {
      const otherUser = match.userId === authUser.id ? match.matchedUser : match.user;
      
      // Get unlock progress for this match
      const unlockProgress = await prisma.unlockProgress.findUnique({
        where: {
          userId_targetUserId: {
            userId: authUser.id,
            targetUserId: otherUser.id,
          },
        },
      });

      // Get the last message for this match
      const lastMessage = await prisma.message.findFirst({
        where: { matchId: match.id },
        orderBy: { createdAt: 'desc' },
        select: {
          content: true,
          createdAt: true,
        },
      });

      // Apply blur to photos based on unlock progress
      // Map unlock level to blur stages: 0% → 20px, 10% → 15px, 30% → 10px, 50% → 5px, 100% → 0px
      // Using smaller blur values to maintain color visibility
      const getBlurLevel = (unlockLevel: number): number => {
        if (unlockLevel >= 100) return 0;
        if (unlockLevel >= 50) return 5;
        if (unlockLevel >= 30) return 10;
        if (unlockLevel >= 10) return 15;
        return 20; // 0-10% - initial blur, still shows color
      };

      const photosWithBlur = (otherUser.photos || []).map((photo: any) => {
        const progress = unlockProgress?.unlockLevel || 0;
        const effectiveBlur = getBlurLevel(progress);
        return {
          ...photo,
          blurLevel: effectiveBlur,
        };
      });

      return {
        id: match.id,
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
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt.toISOString(),
        } : null,
        // 用于排序：如果有最后一条消息，使用消息时间；否则使用匹配时间
        sortTime: lastMessage ? lastMessage.createdAt : (match.matchedAt || match.createdAt),
      };
    }));

    // 按最后消息时间排序（最新的在最上面）
    formattedMatches.sort((a: any, b: any) => {
      const timeA = new Date(a.sortTime).getTime();
      const timeB = new Date(b.sortTime).getTime();
      return timeB - timeA; // 降序：最新的在前
    });

    // 移除 sortTime，不需要返回给前端
    const finalMatches = formattedMatches.map((match: any) => {
      const { sortTime, ...rest } = match;
      return rest;
    });

    console.log('Formatted matches:', finalMatches.map((m: any) => ({
      id: m.id,
      userName: m.user.name,
      photosCount: m.user.photos?.length || 0,
      lastMessageTime: m.lastMessage?.createdAt,
    })));

    return NextResponse.json({ matches: finalMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    );
  }
}

