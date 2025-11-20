import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 发起游戏 - 选择主题
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const { matchId, topic } = await request.json();

    if (!matchId || !topic) {
      return NextResponse.json(
        { error: 'Match ID and topic are required' },
        { status: 400 }
      );
    }

    // 验证match是否存在且用户参与其中
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.userId !== authUser.id && match.matchedUserId !== authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const responderId = match.userId === authUser.id ? match.matchedUserId : match.userId;

    // 创建游戏会话
    const gameSession = await prisma.gameSession.create({
      data: {
        matchId,
        initiatorId: authUser.id,
        responderId,
        topic,
        status: 'waiting_answer',
      },
    });

    // 根据主题获取一个问题
    const question = await prisma.question.findFirst({
      where: {
        category: topic,
        isActive: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'No question found for this topic' },
        { status: 404 }
      );
    }

    // 更新游戏会话的问题ID
    await prisma.gameSession.update({
      where: { id: gameSession.id },
      data: { questionId: question.id },
    });

    return NextResponse.json({
      gameSession: {
        ...gameSession,
        question,
      },
    });
  } catch (error) {
    console.error('Initiate game error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate game' },
      { status: 500 }
    );
  }
}

