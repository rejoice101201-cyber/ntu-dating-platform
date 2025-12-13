import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import { pusherServer } from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const { chatId } = await params;
    const body = await req.json();
    const { content, type = 'text' } = body;

    if (!content) {
      return NextResponse.json({ error: '訊息內容不能為空' }, { status: 400 });
    }

    await connectDB();

    // 檢查聊天室是否存在
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: '聊天室不存在' }, { status: 404 });
    }

    // 檢查用戶是否為參與者
    const isParticipant = chat.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: '無權限' }, { status: 403 });
    }

    // 以 senderId + content + chatId + 近3秒內的訊息去重，避免前端/事件重送
    const now = new Date();
    const threeSecondsAgo = new Date(now.getTime() - 3000);
    const existing = await Message.findOne({
      chatId,
      senderId: session.user.id,
      content: content.trim(),
      createdAt: { $gte: threeSecondsAgo },
    }).sort({ createdAt: -1 }); // 取最新的

    const message =
      existing ||
      (await Message.create({
        chatId: chatId,
        senderId: session.user.id,
        content,
        type,
      }));

    // 更新聊天室的最後訊息時間
    await Chat.findByIdAndUpdate(chatId, {
      lastMessageAt: new Date(),
    });

    // 發送 Pusher 事件（如果已存在就不要再推一次）
    if (pusherServer && !existing) {
      await pusherServer.trigger(
        `chat-${chatId}`,
        'new-message',
        {
          _id: message._id,
          chatId: message.chatId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
        }
      );
    }

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error.message || '發送訊息失敗' },
      { status: 500 }
    );
  }
}

