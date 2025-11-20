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

      // Apply blur to photos based on unlock progress
      // Map unlock level to blur stages: 0% → 90px, 10% → 70px, 30% → 50px, 50% → 10px, 100% → 0px
      const getBlurLevel = (unlockLevel: number): number => {
        if (unlockLevel >= 100) return 0;
        if (unlockLevel >= 50) return 10;
        if (unlockLevel >= 30) return 50;
        if (unlockLevel >= 10) return 70;
        return 90; // 0-10%
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
      };
    }));

    console.log('Formatted matches:', formattedMatches.map((m: any) => ({
      id: m.id,
      userName: m.user.name,
      photosCount: m.user.photos?.length || 0,
    })));

    return NextResponse.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    );
  }
}

