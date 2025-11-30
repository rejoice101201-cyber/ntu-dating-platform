import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await req.json();
    const { socket_id, channel_name } = body;

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 認證 Pusher 頻道
    if (!pusherServer) {
      return NextResponse.json(
        { error: 'Pusher 未配置' },
        { status: 500 }
      );
    }

    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: session.user.id,
      user_info: {
        name: (session.user as any).name,
        userID: (session.user as any).userID,
      },
    });

    return NextResponse.json(authResponse);
  } catch (error: any) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: error.message || '認證失敗' },
      { status: 500 }
    );
  }
}

