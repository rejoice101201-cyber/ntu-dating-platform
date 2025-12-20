import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// 添加所有類別的問題（用於初始化資料庫）
// 這個端點可以被調用以確保所有題目都存在
export async function POST(request: NextRequest) {
  // 可選：需要認證（如果需要的話）
  // const authResult = await requireAuth(request);
  // if (authResult instanceof Response) {
  //   return authResult;
  // }
  try {
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

    // 使用 findFirst + create/update 的方式來避免重複創建
    const createdQuestions = [];
    const updatedQuestions = [];
    
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
      } else {
        // 如果已存在，更新它以確保 isActive 為 true
        await prisma.question.update({
          where: { id: existing.id },
          data: { 
            isActive: true,
            type: question.type,
            options: question.options,
          },
        });
        updatedQuestions.push(existing);
      }
    }

    // 返回每個類別的統計
    const categoryStats = await prisma.question.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      message: 'Questions seeded successfully',
      created: createdQuestions.length,
      updated: updatedQuestions.length,
      total: questions.length,
      categoryStats: categoryStats.map(c => ({
        category: c.category,
        count: c._count.id,
      })),
    });
  } catch (error) {
    console.error('Seed questions error:', error);
    return NextResponse.json(
      { error: 'Failed to seed questions' },
      { status: 500 }
    );
  }
}

