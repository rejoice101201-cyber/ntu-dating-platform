import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-__v');
    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || '取得個人資料失敗' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      personality,
      interests,
      appearance,
      age,
      location,
      photos,
    } = body;

    await connectDB();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (personality !== undefined) updateData.personality = personality;
    if (interests !== undefined) updateData.interests = interests;
    if (appearance !== undefined) updateData.appearance = appearance;
    if (age !== undefined) updateData.age = age;
    if (location !== undefined) updateData.location = location;
    if (photos !== undefined) {
      updateData.photos = photos;
      updateData.image = photos?.[0] || null; // 第一張照片作為頭像
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || '更新個人資料失敗' },
      { status: 500 }
    );
  }
}




