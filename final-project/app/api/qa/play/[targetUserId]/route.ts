import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { targetUserId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { targetUserId } = params;

  try {
    const body = await request.json();
    const { questionIds, answers } = body;

    if (!Array.isArray(questionIds) || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid game data' },
        { status: 400 }
      );
    }

    // Check energy
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { energy: true },
    });

    if (!user || user.energy < 10) {
      return NextResponse.json(
        { error: 'Not enough energy' },
        { status: 400 }
      );
    }

    // Get target user's answers
    const targetAnswers = await prisma.qAAnswer.findMany({
      where: {
        userId: targetUserId,
        questionId: { in: questionIds },
      },
    });

    // Compare answers and calculate match
    let matchingAnswers = 0;
    questionIds.forEach((qId: string, index: number) => {
      const targetAnswer = targetAnswers.find((ta: any) => ta.questionId === qId);
      if (targetAnswer && targetAnswer.answer === answers[index]) {
        matchingAnswers++;
      }
    });

    const matchPercentage = (matchingAnswers / questionIds.length) * 100;

    // Update unlock progress
    const unlockProgress = await prisma.unlockProgress.upsert({
      where: {
        userId_targetUserId: {
          userId: authUser.id,
          targetUserId,
        },
      },
      create: {
        userId: authUser.id,
        targetUserId,
        qaCompleted: questionIds.length,
        unlockLevel: Math.min(100, Math.floor(matchPercentage)),
        interactionCount: 1,
      },
      update: {
        qaCompleted: { increment: questionIds.length },
        unlockLevel: Math.min(100, Math.floor(matchPercentage)),
        interactionCount: { increment: 1 },
      },
    });

    // Deduct energy
    await prisma.user.update({
      where: { id: authUser.id },
      data: { energy: Math.max(user.energy - 10, 0) },
    });

    return NextResponse.json({
      matchPercentage: Math.round(matchPercentage),
      matchingAnswers,
      totalQuestions: questionIds.length,
      unlockProgress,
    });
  } catch (error) {
    console.error('Play Q&A error:', error);
    return NextResponse.json(
      { error: 'Failed to play Q&A game' },
      { status: 500 }
    );
  }
}

