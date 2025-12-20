import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPusher } from '@/lib/pusher';

// 發起者猜測答案
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const { gameSessionId, guess } = await request.json();

    if (!gameSessionId || !guess) {
      return NextResponse.json(
        { error: 'Game session ID and guess are required' },
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

    if (gameSession.initiatorId !== authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you are not the initiator' },
        { status: 403 }
      );
    }

    if (gameSession.status !== 'waiting_guess') {
      return NextResponse.json(
        { error: 'Game session is not waiting for guess' },
        { status: 400 }
      );
    }

    // 判斷猜測是否正確
    const isCorrect = guess === gameSession.responderAnswer;
    const winnerId = isCorrect ? gameSession.initiatorId : gameSession.responderId;

    // 更新遊戲會話
    const updatedSession = await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        initiatorGuess: guess,
        status: 'completed',
        winnerId,
      },
    });

    // 給獲勝者一把鑰匙
    const unlockProgress = await prisma.unlockProgress.upsert({
      where: {
        userId_targetUserId: {
          userId: winnerId,
          targetUserId: winnerId === gameSession.initiatorId 
            ? gameSession.responderId 
            : gameSession.initiatorId,
        },
      },
      update: {
        keys: { increment: 1 },
      },
      create: {
        userId: winnerId,
        targetUserId: winnerId === gameSession.initiatorId 
          ? gameSession.responderId 
          : gameSession.initiatorId,
        keys: 1,
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
        isCorrect,
        winnerId,
      });
    } catch (pusherError) {
      console.warn('Pusher not configured, game state not broadcast:', pusherError);
    }

    return NextResponse.json({
      gameSession: {
        ...updatedSession,
        question,
      },
      isCorrect,
      winnerId,
      unlockProgress,
    });
  } catch (error) {
    console.error('Guess game error:', error);
    return NextResponse.json(
      { error: 'Failed to submit guess' },
      { status: 500 }
    );
  }
}

