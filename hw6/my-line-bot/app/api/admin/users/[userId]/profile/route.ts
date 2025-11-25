import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/services/lineProfileService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('取得使用者 Profile 錯誤:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', message: error?.message },
      { status: 500 }
    );
  }
}





