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

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        tags: {
          include: { tag: true },
        },
        matches: true,
        ratings: true,
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

    const recommendations = await prisma.user.findMany({
      where: {
        id: { 
          not: authUser.id,
          notIn: matchedUserIds,
        },
        isActive: true,
        isVerified: true,
      },
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

    // Calculate match score based on common tags
    const scoredRecommendations = recommendations.map((user: any) => {
      const commonTags = user.tags.filter((ut: any) => userTagIds.includes(ut.tagId));
      const matchScore = (commonTags.length / Math.max(userTagIds.length, user.tags.length)) * 100;

      return {
        ...user,
        matchScore: Math.round(matchScore),
        commonTags: commonTags.map((ut: any) => ut.tag),
      };
    });

    // Sort by match score
    scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ recommendations: scoredRecommendations });
  } catch (error) {
    console.error('Discover error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

