import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const answerSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const body = await request.json();
    const data = answerSchema.parse(body);

    // Check energy
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { energy: true },
    });

    if (!user || user.energy < 3) {
      return NextResponse.json(
        { error: 'Not enough energy' },
        { status: 400 }
      );
    }

    const answer = await prisma.qAAnswer.upsert({
      where: {
        userId_questionId: {
          userId: authUser.id,
          questionId: data.questionId,
        },
      },
      create: {
        userId: authUser.id,
        questionId: data.questionId,
        answer: data.answer,
      },
      update: {
        answer: data.answer,
      },
    });

    // Deduct energy
    await prisma.user.update({
      where: { id: authUser.id },
      data: { energy: { decrement: 3 } },
    });

    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Submit answer error:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

