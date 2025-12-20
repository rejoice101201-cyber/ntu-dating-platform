import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPusher } from '@/lib/pusher';

// 初始化問題的輔助函數
async function initializeQuestions() {
  const questions = [
    // Interest 類別
    {
      content: '你最喜欢的电影类型是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['动作片', '爱情片', '科幻片', '恐怖片', '喜剧片']),
      isActive: true,
    },
    {
      content: '你最喜欢的音乐类型是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['流行', '摇滚', '古典', '爵士', '电子']),
      isActive: true,
    },
    {
      content: '你最喜欢的运动是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['跑步', '游泳', '篮球', '瑜伽', '健身']),
      isActive: true,
    },
    {
      content: '你最喜欢的旅行方式是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['自由行', '跟团游', '背包客', '豪华游', '宅在家']),
      isActive: true,
    },
    
    // Personality 類別
    {
      content: '在聚会上，你通常是？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['活跃气氛的人', '安静观察的人', '和几个朋友聊天', '提前离开']),
      isActive: true,
    },
    {
      content: '面对压力时，你通常会？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['冷靜分析', '尋求幫助', '獨自承受', '逃避問題']),
      isActive: true,
    },
    {
      content: '你更倾向于？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['計畫一切', '隨性而為', '看情況', '兩者都有']),
      isActive: true,
    },
    {
      content: '你更喜欢？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['獨處', '和朋友在一起', '兩者都喜歡', '看心情']),
      isActive: true,
    },
    
    // Lifestyle 類別
    {
      content: '你更喜欢哪种周末活动？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['宅在家里', '户外活动', '和朋友聚会', '独自探索']),
      isActive: true,
    },
    {
      content: '你更喜欢旅行还是宅在家？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['旅行', '宅在家', '都可以']),
      isActive: true,
    },
    {
      content: '你更喜欢早睡早起还是夜猫子？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['早睡早起', '夜貓子', '看情況']),
      isActive: true,
    },
    {
      content: '你更喜欢在家做饭还是外出用餐？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['在家做饭', '外出用餐', '都可以', '看心情']),
      isActive: true,
    },
    
    // Icebreaker 類別
    {
      content: '第一次约会，你更倾向于？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['咖啡厅聊天', '看电影', '户外活动', '一起做饭']),
      isActive: true,
    },
    {
      content: '你理想的约会地点是？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['海边', '山上', '城市', '家里']),
      isActive: true,
    },
    {
      content: '你更喜欢哪种沟通方式？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['面对面聊天', '电话', '文字消息', '视频通话']),
      isActive: true,
    },
    {
      content: '你觉得什么最重要？',
      category: 'icebreaker',
      type: 'multiple_choice',
      options: JSON.stringify(['诚实', '幽默感', '共同兴趣', '互相理解']),
      isActive: true,
    },
  ];

  // 確保問題存在且激活
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
      // 更新現有問題確保激活
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

// 發起遊戲 - 選擇主題
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

    // 驗證match是否存在且用戶參與其中
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

    // 創建遊戲會話
    const gameSession = await prisma.gameSession.create({
      data: {
        matchId,
        initiatorId: authUser.id,
        responderId,
        topic,
        status: 'waiting_answer',
      },
    });

    // 根據主題獲取一個問題（隨機選擇）
    let allQuestions = await prisma.question.findMany({
      where: {
        category: topic,
        isActive: true,
      },
    });

    console.log(`Found ${allQuestions.length} questions for topic: ${topic}`);

    // 如果沒有問題，自動初始化問題
    if (!allQuestions || allQuestions.length === 0) {
      console.log(`No questions found for topic: ${topic}, initializing...`)
      try {
        await initializeQuestions()
        console.log(`Questions initialized for topic: ${topic}`)
      } catch (initError) {
        console.error('Failed to initialize questions:', initError)
      }
      
      // 重新查詢
      allQuestions = await prisma.question.findMany({
        where: {
          category: topic,
          isActive: true,
        },
      });
      console.log(`After initialization, found ${allQuestions.length} questions for topic: ${topic}`)
    }

    // 如果還是沒有問題，嘗試查詢所有類別看看資料庫裡有什麼
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

    // 隨機選擇一個問題
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

    // 更新遊戲會話的問題ID
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
      // 即使更新失敗，也返回遊戲會話和題目，讓前端可以處理
      updatedSession = gameSession;
    }

    // 確保 questionId 被正確設置
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
        // 即使更新失敗，也手動設置 questionId 在返回對象中
        updatedSession = { ...updatedSession, questionId: question.id };
      }
    }

    // 通過Pusher通知對方
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

