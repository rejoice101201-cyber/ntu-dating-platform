import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const resolvedParams = await Promise.resolve(params);
  const { id: userId } = resolvedParams;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get unlock progress if viewing other user's profile
    let unlockProgress = null;
    if (userId !== authUser.id) {
      unlockProgress = await prisma.unlockProgress.findUnique({
        where: {
          userId_targetUserId: {
            userId: authUser.id,
            targetUserId: userId,
          },
        },
      });
    }

    // Apply blur to photos based on unlock progress
    // Map unlock level to blur stages: 0% → 90px, 10% → 70px, 30% → 50px, 50% → 10px, 100% → 0px
    const getBlurLevel = (unlockLevel: number): number => {
      if (unlockLevel >= 100) return 0;
      if (unlockLevel >= 50) return 10;
      if (unlockLevel >= 30) return 50;
      if (unlockLevel >= 10) return 70;
      return 90; // 0-10%
    };

    const photos = user.photos.map((photo: any) => {
      if (userId === authUser.id) {
        return { ...photo, blurLevel: 0 }; // Own photos are never blurred
      }

      const progress = unlockProgress?.unlockLevel || 0;
      const effectiveBlur = getBlurLevel(progress);
      
      return {
        ...photo,
        blurLevel: effectiveBlur,
      };
    });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      ...userWithoutPassword,
      photos,
      unlockProgress,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

