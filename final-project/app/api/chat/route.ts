import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import User from '@/models/User';
import { truncateText } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    await connectDB();

    // 取得當前用戶的所有聊天室
    const chats = await Chat.find({
      participants: session.user.id,
      status: 'active',
    })
      .populate('participants', 'userID name image')
      .sort({ lastMessageAt: -1, createdAt: -1 });

    // 取得每個聊天室的最後一條訊息
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .populate('senderId', 'userID name image');

        const otherParticipant = chat.participants.find(
          (p: any) => p._id.toString() !== session.user.id
        ) as any;

        return {
          _id: chat._id,
          participant: otherParticipant
            ? {
                _id: otherParticipant._id,
                userID: otherParticipant.userID,
                name: otherParticipant.name,
                image: otherParticipant.image,
              }
            : null,
          lastMessage: lastMessage
            ? {
                content: truncateText(lastMessage.content, 50),
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          lastMessageAt: chat.lastMessageAt || chat.createdAt,
          createdAt: chat.createdAt,
        };
      })
    );

    return NextResponse.json({ chats: chatsWithLastMessage });
  } catch (error: any) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { error: error.message || '取得聊天室列表失敗' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await req.json();
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json({ error: '缺少 participantId' }, { status: 400 });
    }

    await connectDB();

    // 檢查是否已經有聊天室
    const existingChat = await Chat.findOne({
      participants: { $all: [session.user.id, participantId] },
    });

    if (existingChat) {
      return NextResponse.json({ chat: existingChat });
    }

    // 創建新聊天室
    const chat = await Chat.create({
      participants: [session.user.id, participantId],
      isFriend: true, // 從配對來的都是朋友
      status: 'active',
    });

    return NextResponse.json({ chat });
  } catch (error: any) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: error.message || '創建聊天室失敗' },
      { status: 500 }
    );
  }
}




