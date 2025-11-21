import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Match from '@/models/Match';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await req.json();
    const { matchedUserId } = body;

    if (!matchedUserId) {
      return NextResponse.json({ error: '缺少 matchedUserId' }, { status: 400 });
    }

    await connectDB();

    // 檢查是否已經配對過
    const existingMatch = await Match.findOne({
      userId: session.user.id,
      matchedUserId,
    });

    if (existingMatch) {
      return NextResponse.json({ error: '已經配對過此用戶' }, { status: 400 });
    }

    // 創建 pass 記錄
    const match = await Match.create({
      userId: session.user.id,
      matchedUserId,
      status: 'passed',
    });

    return NextResponse.json({ success: true, match });
  } catch (error: any) {
    console.error('Pass error:', error);
    return NextResponse.json(
      { error: error.message || '跳過失敗' },
      { status: 500 }
    );
  }
}




