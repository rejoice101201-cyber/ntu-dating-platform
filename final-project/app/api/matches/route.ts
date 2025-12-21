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
    // 使用重試機制執行查詢
    const matches = await withRetry(async () => {
      return await prisma.match.findMany({
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
          lastMessage: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc' as const,
            },
            take: 1,
          },
        },
        orderBy: [
          {
            lastMessage: {
              createdAt: 'desc' as const,
            },
          },
          {
            matchedAt: 'desc' as const,
          },
        ],
      });
    });

    // Format matches to always show the other user
    const formattedMatches = await Promise.all(matches.map(async (match: any) => {
      const otherUser = match.userId === authUser.id ? match.matchedUser : match.user;
      
      // Get unlock progress for this match（使用重試機制）
      const unlockProgress = await withRetry(async () => {
        return await prisma.unlockProgress.findUnique({
          where: {
            userId_targetUserId: {
              userId: authUser.id,
              targetUserId: otherUser.id,
            },
          },
        });
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
        lastMessageAt: match.lastMessage?.[0]?.createdAt || match.matchedAt,
      };
    }));

    console.log('Formatted matches:', formattedMatches.map((m: any) => ({
      id: m.id,
      userName: m.user.name,
      photosCount: m.user.photos?.length || 0,
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

