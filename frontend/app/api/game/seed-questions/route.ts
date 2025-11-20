import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 添加所有类别的问题（用于初始化数据库）
export async function POST(request: NextRequest) {
  try {
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

    // 使用 upsert 来避免重复创建
    for (const question of questions) {
      await prisma.question.upsert({
        where: {
          id: '', // 这里需要根据内容来查找，但Prisma不支持，所以我们先检查是否存在
        },
        create: question,
        update: question,
      });
    }

    // 由于 Prisma 不支持基于内容的唯一约束，我们使用 findFirst + create 的方式
    const createdQuestions = [];
    for (const question of questions) {
      const existing = await prisma.question.findFirst({
        where: {
          content: question.content,
          category: question.category,
        },
      });

      if (!existing) {
        const created = await prisma.question.create({
          data: question,
        });
        createdQuestions.push(created);
      }
    }

    return NextResponse.json({
      message: 'Questions seeded successfully',
      created: createdQuestions.length,
      total: questions.length,
    });
  } catch (error) {
    console.error('Seed questions error:', error);
    return NextResponse.json(
      { error: 'Failed to seed questions' },
      { status: 500 }
    );
  }
}

