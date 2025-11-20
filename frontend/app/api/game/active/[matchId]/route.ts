import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取当前匹配的活跃游戏会话
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> | { matchId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const resolvedParams = await Promise.resolve(params);
  const { matchId } = resolvedParams;

  try {
    // 查找当前用户参与的活跃游戏会话
    const gameSession = await prisma.gameSession.findFirst({
      where: {
        matchId,
        OR: [
          { initiatorId: authUser.id },
          { responderId: authUser.id },
        ],
        status: {
          in: ['waiting_answer', 'waiting_guess'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!gameSession) {
      return NextResponse.json({ gameSession: null });
    }

    // 获取问题详情
    let question = null;
    if (gameSession.questionId) {
      question = await prisma.question.findUnique({
        where: { id: gameSession.questionId },
      });
    }

    return NextResponse.json({
      gameSession: {
        ...gameSession,
        question,
      },
    });
  } catch (error) {
    console.error('Get active game session error:', error);
    return NextResponse.json(
      { error: 'Failed to get active game session' },
      { status: 500 }
    );
  }
}

