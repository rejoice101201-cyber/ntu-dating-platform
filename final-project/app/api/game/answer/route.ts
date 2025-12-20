import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPusher } from '@/lib/pusher';

// 回答者回答問題
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const { gameSessionId, answer } = await request.json();

    if (!gameSessionId || !answer) {
      return NextResponse.json(
        { error: 'Game session ID and answer are required' },
        { status: 400 }
      );
    }

    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
    });

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    if (gameSession.responderId !== authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you are not the responder' },
        { status: 403 }
      );
    }

    if (gameSession.status !== 'waiting_answer') {
      return NextResponse.json(
        { error: 'Game session is not waiting for answer' },
        { status: 400 }
      );
    }

    // 更新遊戲會話
    const updatedSession = await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        responderAnswer: answer,
        status: 'waiting_guess',
      },
    });

    // 獲取問題詳情
    let question = null;
    if (updatedSession.questionId) {
      question = await prisma.question.findUnique({
        where: { id: updatedSession.questionId },
      });
    }

    // 通過Pusher通知對方
    try {
      const pusher = getPusher();
      await pusher.trigger(`match-${gameSession.matchId}`, 'game_state_update', {
        gameSession: {
          ...updatedSession,
          question,
        },
      });
    } catch (pusherError) {
      console.warn('Pusher not configured, game state not broadcast:', pusherError);
    }

    return NextResponse.json({
      gameSession: {
        ...updatedSession,
        question,
      },
    });
  } catch (error) {
    console.error('Answer game error:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

