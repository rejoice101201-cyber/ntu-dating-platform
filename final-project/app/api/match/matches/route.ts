import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    await connectDB();

    // 取得雙向匹配的用戶（雙方都 liked）
    const myLikes = await Match.find({
      userId: session.user.id,
      status: 'liked',
    }).select('matchedUserId');

    const matchedUserIds = myLikes.map((m) => m.matchedUserId.toString());

    // 檢查這些用戶是否也喜歡我
    const mutualMatches = await Match.find({
      userId: { $in: matchedUserIds },
      matchedUserId: session.user.id,
      status: 'liked',
    }).select('userId');

    const mutualMatchIds = mutualMatches.map((m) => m.userId.toString());

    // 取得匹配用戶的完整資料（包括照片）
    const matchedUsers = await User.find({
      _id: { $in: mutualMatchIds },
    }).select('userID name image photos bio personality interests appearance age location');

    return NextResponse.json({ matches: matchedUsers });
  } catch (error: any) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: error.message || '取得配對失敗' },
      { status: 500 }
    );
  }
}




