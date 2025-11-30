import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取游戏会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> | { sessionId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const resolvedParams = await Promise.resolve(params);
  const { sessionId } = resolvedParams;

  try {
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        match: true,
      },
    });

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    // 验证用户是否参与这个游戏
    if (gameSession.initiatorId !== authUser.id && gameSession.responderId !== authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 如果有问题ID，获取问题详情
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
    console.error('Get game session error:', error);
    return NextResponse.json(
      { error: 'Failed to get game session' },
      { status: 500 }
    );
  }
}

