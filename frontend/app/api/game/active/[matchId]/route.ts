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

    console.log('Found game session:', {
      id: gameSession.id,
      status: gameSession.status,
      questionId: gameSession.questionId,
      topic: gameSession.topic,
    });

    // 获取问题详情
    let question = null;
    if (gameSession.questionId) {
      try {
        question = await prisma.question.findUnique({
          where: { id: gameSession.questionId },
        });
        if (!question) {
          console.error('Question not found for questionId:', gameSession.questionId);
        } else {
          console.log('Found question:', {
            id: question.id,
            content: question.content,
            category: question.category,
          });
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    } else {
      console.warn('Game session has no questionId:', gameSession.id);
      // 如果 questionId 为空，尝试根据 topic 查找一个问题
      if (gameSession.topic) {
        console.log('Attempting to find a question for topic:', gameSession.topic);
        try {
          const questions = await prisma.question.findMany({
            where: {
              category: gameSession.topic,
              isActive: true,
            },
            take: 1,
          });
          if (questions.length > 0) {
            question = questions[0];
            console.log('Found fallback question:', question.id);
            // 尝试更新游戏会话的 questionId
            try {
              await prisma.gameSession.update({
                where: { id: gameSession.id },
                data: { questionId: question.id },
              });
              console.log('Updated game session with questionId:', question.id);
              gameSession.questionId = question.id;
            } catch (updateError) {
              console.error('Failed to update game session with questionId:', updateError);
            }
          }
        } catch (error) {
          console.error('Error finding fallback question:', error);
        }
      }
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

