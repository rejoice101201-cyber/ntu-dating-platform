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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get current user with preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        tags: {
          include: { tag: true },
        },
        matches: true,
        ratings: true,
        matchPreference: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's tag IDs
    const userTagIds = currentUser.tags.map((ut: any) => ut.tagId);

    // Find users with common tags, different gender (if preference), not already matched
    const matchedUserIds = [
      ...currentUser.matches.map((m: any) => m.matchedUserId),
      ...currentUser.ratings.map((r: any) => r.ratedUserId),
    ];

    console.log('Current user:', {
      id: authUser.id,
      email: currentUser.email,
      isActive: currentUser.isActive,
      isVerified: currentUser.isVerified,
      tagsCount: userTagIds.length,
      matchedUserIds: matchedUserIds.length,
      ratingsCount: currentUser.ratings.length,
      matchPreference: currentUser.matchPreference,
    });

    // Get all available users for debugging
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: authUser.id },
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isVerified: true,
      },
    });

    console.log('All users in database:', allUsers);

    // Build where clause based on match preferences
    const whereClause: any = {
      id: { 
        not: authUser.id,
        notIn: matchedUserIds,
      },
      isActive: true,
    };

    // Apply gender preference filter
    if (currentUser.matchPreference?.gender) {
      whereClause.gender = currentUser.matchPreference.gender;
    }

    // Apply age range filter
    if (currentUser.matchPreference?.minAge || currentUser.matchPreference?.maxAge) {
      const now = new Date();
      if (currentUser.matchPreference.minAge) {
        const maxBirthday = new Date(now.getFullYear() - currentUser.matchPreference.minAge, now.getMonth(), now.getDate());
        whereClause.birthday = { ...whereClause.birthday, lte: maxBirthday };
      }
      if (currentUser.matchPreference.maxAge) {
        const minBirthday = new Date(now.getFullYear() - currentUser.matchPreference.maxAge - 1, now.getMonth(), now.getDate());
        whereClause.birthday = { ...whereClause.birthday, gte: minBirthday };
      }
    }

    const recommendations = await prisma.user.findMany({
      where: whereClause,
      include: {
        photos: {
          where: { isCover: true },
          take: 1,
        },
        tags: {
          include: { tag: true },
          take: 5,
        },
      },
      take: limit,
      skip: offset,
    });

    // Map unlock level to blur stages: 0% → 20px, 10% → 15px, 30% → 10px, 50% → 5px, 100% → 0px
    // Using smaller blur values to maintain color visibility
    const getBlurLevel = (unlockLevel: number): number => {
      if (unlockLevel >= 100) return 0;
      if (unlockLevel >= 50) return 5;
      if (unlockLevel >= 30) return 10;
      if (unlockLevel >= 10) return 15;
      return 20; // 0-10% - initial blur, still shows color
    };

    // Calculate match score based on common tags and apply blur to photos
    const scoredRecommendations = await Promise.all(recommendations.map(async (user: any) => {
      const commonTags = user.tags.filter((ut: any) => userTagIds.includes(ut.tagId));
      const matchScore = (commonTags.length / Math.max(userTagIds.length, user.tags.length)) * 100;

      // Get unlock progress for this user
      const unlockProgress = await prisma.unlockProgress.findUnique({
        where: {
          userId_targetUserId: {
            userId: authUser.id,
            targetUserId: user.id,
          },
        },
      });

      // Apply blur to photos based on unlock progress
      const photosWithBlur = (user.photos || []).map((photo: any) => {
        const progress = unlockProgress?.unlockLevel || 0;
        const effectiveBlur = getBlurLevel(progress);
        return {
          ...photo,
          blurLevel: effectiveBlur,
        };
      });

      return {
        ...user,
        photos: photosWithBlur,
        matchScore: Math.round(matchScore),
        commonTags: commonTags.map((ut: any) => ut.tag),
      };
    }));

    // Sort by match score
    scoredRecommendations.sort((a: any, b: any) => b.matchScore - a.matchScore);

    console.log('Recommendations found:', {
      count: scoredRecommendations.length,
      users: scoredRecommendations.map((r: any) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        isActive: r.isActive,
        isVerified: r.isVerified,
        matchScore: r.matchScore,
      })),
    });

    return NextResponse.json({ recommendations: scoredRecommendations });
  } catch (error) {
    console.error('Discover error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

