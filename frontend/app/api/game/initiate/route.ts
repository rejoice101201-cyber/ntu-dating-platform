import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPusher } from '@/lib/pusher';

// 初始化问题的辅助函数
async function initializeQuestions() {
  const questions = [
    // Interest 类别
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
    
    // Personality 类别
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
      options: JSON.stringify(['冷静分析', '寻求帮助', '独自承受', '逃避问题']),
      isActive: true,
    },
    {
      content: '你更倾向于？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['计划一切', '随性而为', '看情况', '两者都有']),
      isActive: true,
    },
    {
      content: '你更喜欢？',
      category: 'personality',
      type: 'multiple_choice',
      options: JSON.stringify(['独处', '和朋友在一起', '两者都喜欢', '看心情']),
      isActive: true,
    },
    
    // Lifestyle 类别
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
      options: JSON.stringify(['早睡早起', '夜猫子', '看情况']),
      isActive: true,
    },
    {
      content: '你更喜欢在家做饭还是外出用餐？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['在家做饭', '外出用餐', '都可以', '看心情']),
      isActive: true,
    },
    
    // Icebreaker 类别
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

    // 更新游戏会话的问题ID
    const updatedSession = await prisma.gameSession.update({
      where: { id: gameSession.id },
      data: { questionId: question.id },
    });

    // 通过Pusher通知对方
    try {
      const pusher = getPusher();
      await pusher.trigger(`match-${matchId}`, 'game_state_update', {
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
    console.error('Initiate game error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate game' },
      { status: 500 }
    );
  }
}

