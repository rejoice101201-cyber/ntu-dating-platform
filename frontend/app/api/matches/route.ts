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
      const photosWithBlur = (otherUser.photos || []).map((photo: any) => {
        const progress = unlockProgress?.unlockLevel || 0;
        const effectiveBlur = Math.max(0, (photo.blurLevel || 100) - progress);
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

