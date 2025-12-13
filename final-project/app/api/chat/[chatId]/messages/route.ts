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

    // 以 senderId + content + chatId + 近5秒內的訊息去重，避免前端/事件重送
    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - 5000);
    const trimmedContent = content.trim();
    
    console.log('[後端] 收到發送請求:', {
      chatId,
      senderId: session.user.id,
      content: trimmedContent,
      timestamp: now.toISOString(),
    });
    
    const existing = await Message.findOne({
      chatId,
      senderId: session.user.id,
      content: trimmedContent,
      createdAt: { $gte: fiveSecondsAgo },
    }).sort({ createdAt: -1 }); // 取最新的

    if (existing) {
      console.log('[後端] 發現重複訊息，返回現有訊息:', {
        messageId: existing._id,
        createdAt: existing.createdAt,
      });
      return NextResponse.json({ message: existing, duplicate: true });
    }

    const message = await Message.create({
      chatId: chatId,
      senderId: session.user.id,
      content: trimmedContent,
      type,
    });

    console.log('[後端] 建立新訊息:', {
      messageId: message._id,
      content: message.content,
    });

    // 更新聊天室的最後訊息時間
    await Chat.findByIdAndUpdate(chatId, {
      lastMessageAt: new Date(),
    });

    // 發送 Pusher 事件（只有新訊息才推播）
    if (pusherServer) {
      try {
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
        console.log('[後端] Pusher 事件已推播:', `chat-${chatId}`, 'new-message');
      } catch (pusherError) {
        console.error('[後端] Pusher 推播失敗:', pusherError);
      }
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

