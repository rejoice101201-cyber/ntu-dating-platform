import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Match from '@/models/Match';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findById(session.user.id);
    if (!currentUser || !currentUser.userID) {
      return NextResponse.json({ error: '請先完成註冊' }, { status: 400 });
    }

    // 取得已配對過的用戶 ID（liked 或 passed）
    const matchedUserIds = await Match.find({
      userId: session.user.id,
    }).select('matchedUserId status');

    const excludedIds = [
      session.user.id,
      ...matchedUserIds.map((m) => m.matchedUserId.toString()),
    ];

    // 取得推薦用戶（排除自己、已配對過的用戶）
    // 階段一：隱藏照片，只顯示基本資訊和標籤
    const recommendations = await User.find({
      _id: { $nin: excludedIds },
      userID: { $exists: true, $ne: null },
    })
      .select('userID name bio personality interests appearance age location')
      .limit(20);

    // 根據興趣和個性標籤計算匹配度（簡單算法）
    const recommendationsWithScore = recommendations.map((user) => {
      let score = 0;
      const currentInterests = currentUser.interests || [];
      const currentPersonality = currentUser.personality || [];
      const userInterests = user.interests || [];
      const userPersonality = user.personality || [];

      // 計算興趣匹配度
      const commonInterests = currentInterests.filter((i) =>
        userInterests.includes(i)
      );
      score += commonInterests.length * 10;

      // 計算個性匹配度
      const commonPersonality = currentPersonality.filter((p) =>
        userPersonality.includes(p)
      );
      score += commonPersonality.length * 5;

      return {
        _id: user._id,
        userID: user.userID,
        name: user.name,
        bio: user.bio,
        personality: user.personality,
        interests: user.interests,
        appearance: user.appearance,
        age: user.age,
        location: user.location,
        score,
      };
    });

    // 按匹配度排序
    recommendationsWithScore.sort((a, b) => b.score - a.score);

    return NextResponse.json({ recommendations: recommendationsWithScore });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: error.message || '取得推薦失敗' },
      { status: 500 }
    );
  }
}




