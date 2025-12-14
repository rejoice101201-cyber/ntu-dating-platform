import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const body = await request.json();
    const { userId: targetUserId, score } = body;

    if (!targetUserId || !score || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Invalid rating data' },
        { status: 400 }
      );
    }

    // Check energy
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { energy: true },
    });

    if (!user || user.energy < 5) {
      return NextResponse.json(
        { error: 'Not enough energy' },
        { status: 400 }
      );
    }

    // Deduct energy
    await prisma.user.update({
      where: { id: authUser.id },
      data: { energy: { decrement: 5 } },
    });

    // Create or update rating
    await prisma.rating.upsert({
      where: {
        userId_ratedUserId: {
          userId: authUser.id,
          ratedUserId: targetUserId,
        },
      },
      update: { score },
      create: {
        userId: authUser.id,
        ratedUserId: targetUserId,
        score,
      },
    });

    // Check if mutual rating creates a match
    const mutualRating = await prisma.rating.findUnique({
      where: {
        userId_ratedUserId: {
          userId: targetUserId,
          ratedUserId: authUser.id,
        },
      },
    });

    if (mutualRating) {
      const totalScore = score + mutualRating.score;
      if (totalScore >= 7) {
        // Create match
        await prisma.match.upsert({
          where: {
            userId_matchedUserId: {
              userId: authUser.id,
              matchedUserId: targetUserId,
            },
          },
          update: { 
            status: 'matched',
            matchedAt: new Date(), // Set matchedAt when updating to matched
          },
          create: {
            userId: authUser.id,
            matchedUserId: targetUserId,
            status: 'matched',
            matchedAt: new Date(), // Set matchedAt when creating match
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rate error:', error);
    return NextResponse.json(
      { error: 'Failed to rate user' },
      { status: 500 }
    );
  }
}

