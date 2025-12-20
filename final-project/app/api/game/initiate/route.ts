import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPusher } from '@/lib/pusher';

// 初始化问题的辅助函数
async function initializeQuestions() {
  const questions = [
    // Interest 类别
    {
      content: '你最喜歡的電影類型是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['動作片', '愛情片', '科幻片', '恐怖片', '喜劇片']),
      isActive: true,
    },
    {
      content: '你最喜歡的音樂類型是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['流行', '搖滾', '古典', '爵士', '電子']),
      isActive: true,
    },
    {
      content: '你最喜歡的運動是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['跑步', '游泳', '籃球', '瑜伽', '健身']),
      isActive: true,
    },
    {
      content: '你最喜歡的旅行方式是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['自由行', '跟團遊', '背包客', '豪華遊', '宅在家']),
      isActive: true,
    },
    
    // Personality 类别
    {
      content: '在聚會上，你通常是？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['活躍氣氛的人', '安靜觀察的人', '和幾個朋友聊天', '提前離開']),
      isActive: true,
    },
    {
      content: '面對壓力時，你通常會？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['冷靜分析', '尋求幫助', '獨自承受', '逃避問題']),
      isActive: true,
    },
    {
      content: '你更傾向於？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['計畫一切', '隨性而為', '看情況', '兩者都有']),
      isActive: true,
    },
    {
      content: '你更喜歡？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['獨處', '和朋友在一起', '兩者都喜歡', '看心情']),
      isActive: true,
    },
    
    // Lifestyle 类别
    {
      content: '你更喜歡哪種週末活動？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['宅在家裡', '戶外活動', '和朋友聚會', '獨自探索']),
      isActive: true,
    },
    {
      content: '你更喜歡旅行還是宅在家？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['旅行', '宅在家', '都可以']),
      isActive: true,
    },
    {
      content: '你更喜歡早睡早起還是夜貓子？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['早睡早起', '夜貓子', '看情況']),
      isActive: true,
    },
    {
      content: '你更喜歡在家做飯還是外出用餐？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['在家做飯', '外出用餐', '都可以', '看心情']),
      isActive: true,
    },
    
    // Icebreaker 类别
    {
      content: '第一次約會，你更傾向於？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['咖啡廳聊天', '看電影', '戶外活動', '一起做飯']),
      isActive: true,
    },
    {
      content: '你理想的約會地點是？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['海邊', '山上', '城市', '家裡']),
      isActive: true,
    },
    {
      content: '你更喜歡哪種溝通方式？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['面對面聊天', '電話', '文字訊息', '視訊通話']),
      isActive: true,
    },
    {
      content: '你覺得什麼最重要？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['誠實', '幽默感', '共同興趣', '互相理解']),
      isActive: true,
    },
  ];

  // 确保问题存在且激活
  let createdCount = 0;
  let updatedCount = 0;
  
  for (const question of questions) {
    const existing = await prisma.question.findFirst({
      where: {
        content: question.content,
        category: question.category,
      },
    });

    if (!existing) {
      await prisma.question.create({
        data: question,
      });
      createdCount++;
    } else {
      // 更新现有问题确保激活
      await prisma.question.update({
        where: { id: existing.id },
        data: { 
          isActive: true,
          type: question.type,
          options: question.options,
        },
      });
      updatedCount++;
    }
  }
  
  console.log(`Initialized questions: ${createdCount} created, ${updatedCount} updated, total: ${questions.length}`);
}

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

    // 根据主题获取一个问题（随机选择）
    let allQuestions = await prisma.question.findMany({
      where: {
        category: topic,
        isActive: true,
      },
    });

    console.log(`Found ${allQuestions.length} questions for topic: ${topic}`);

    // 如果没有问题，自动初始化问题
    if (!allQuestions || allQuestions.length === 0) {
      console.log(`No questions found for topic: ${topic}, initializing...`)
      try {
        await initializeQuestions()
        console.log(`Questions initialized for topic: ${topic}`)
      } catch (initError) {
        console.error('Failed to initialize questions:', initError)
      }
      
      // 重新查询
      allQuestions = await prisma.question.findMany({
        where: {
          category: topic,
          isActive: true,
        },
      });
      console.log(`After initialization, found ${allQuestions.length} questions for topic: ${topic}`)
    }

    // 如果还是没有问题，尝试查询所有类别看看数据库里有什么
    if (!allQuestions || allQuestions.length === 0) {
      const allCategories = await prisma.question.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
      });
      console.error('Available question categories:', allCategories);
      
      return NextResponse.json(
        { 
          error: `No question found for topic: ${topic} after initialization. Available categories: ${allCategories.map(c => c.category).join(', ')}` 
        },
        { status: 404 }
      );
    }

    // 随机选择一个问题
    const question = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    
    if (!question || !question.id) {
      console.error('Selected question is invalid:', question);
      return NextResponse.json(
        { error: 'Failed to select a valid question' },
        { status: 500 }
      );
    }
    
    console.log('Selected question:', {
      id: question.id,
      content: question.content,
      category: question.category,
    });

    // 更新游戏会话的问题ID
    let updatedSession;
    try {
      updatedSession = await prisma.gameSession.update({
        where: { id: gameSession.id },
        data: { questionId: question.id },
      });
      console.log('Game session updated with questionId:', {
        sessionId: updatedSession.id,
        questionId: updatedSession.questionId,
      });
    } catch (updateError) {
      console.error('Failed to update game session with questionId:', updateError);
      // 即使更新失败，也返回游戏会话和题目，让前端可以处理
      updatedSession = gameSession;
    }

    // 确保 questionId 被正确设置
    if (!updatedSession.questionId) {
      console.error('questionId was not set in updated session, attempting to set it again');
      try {
        updatedSession = await prisma.gameSession.update({
          where: { id: gameSession.id },
          data: { questionId: question.id },
        });
        console.log('Successfully set questionId on retry:', updatedSession.questionId);
      } catch (retryError) {
        console.error('Failed to set questionId on retry:', retryError);
        // 即使更新失败，也手动设置 questionId 在返回对象中
        updatedSession = { ...updatedSession, questionId: question.id };
      }
    }

    // 通过Pusher通知对方
    try {
      const pusher = getPusher();
      const gameSessionForPusher = {
        ...updatedSession,
        questionId: updatedSession.questionId || question.id,
        question,
      };
      console.log('Sending game state update via Pusher:', {
        sessionId: gameSessionForPusher.id,
        questionId: gameSessionForPusher.questionId,
        hasQuestion: !!gameSessionForPusher.question,
      });
      await pusher.trigger(`match-${matchId}`, 'game_state_update', {
        gameSession: gameSessionForPusher,
      });
    } catch (pusherError) {
      console.warn('Pusher not configured, game state not broadcast:', pusherError);
    }

    const responseGameSession = {
      ...updatedSession,
      questionId: updatedSession.questionId || question.id,
      question,
    };
    
    console.log('Returning game session:', {
      id: responseGameSession.id,
      questionId: responseGameSession.questionId,
      hasQuestion: !!responseGameSession.question,
      questionContent: responseGameSession.question?.content,
    });

    return NextResponse.json({
      gameSession: responseGameSession,
    });
  } catch (error) {
    console.error('Initiate game error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate game' },
      { status: 500 }
    );
  }
}

