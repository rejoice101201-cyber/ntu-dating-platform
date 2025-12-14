import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isValidUserID } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await req.json();
    const { userID, photos } = body;

    // 驗證 userID
    if (!userID || !isValidUserID(userID)) {
      return NextResponse.json(
        { error: 'userID 必須是 1-15 個字元，只能包含字母、數字和底線' },
        { status: 400 }
      );
    }

    await connectDB();

    // 檢查 userID 是否已被使用
    const existingUser = await User.findOne({ userID });
    if (existingUser && existingUser._id?.toString() !== session.user.id) {
      return NextResponse.json({ error: '此 userID 已被使用' }, { status: 400 });
    }

    // 更新用戶資料
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        userID,
        photos: photos || [],
        image: photos?.[0] || null, // 第一張照片作為頭像
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error.message || '註冊失敗' },
      { status: 500 }
    );
  }
}

