import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const { chatId } = await params;
    await connectDB();

    const chat = await Chat.findById(chatId).populate(
      'participants',
      'userID name image'
    );

    if (!chat) {
      return NextResponse.json({ error: '聊天室不存在' }, { status: 404 });
    }

    // 檢查用戶是否為參與者
    const isParticipant = chat.participants.some(
      (p: any) => p._id.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: '無權限' }, { status: 403 });
    }

    // 取得訊息
    const messages = await Message.find({ chatId: chatId })
      .populate('senderId', 'userID name image')
      .sort({ createdAt: 1 });

    const otherParticipant = chat.participants.find(
      (p: any) => p._id.toString() !== session.user.id
    );

    return NextResponse.json({
      chat: {
        _id: chat._id,
        participant: otherParticipant,
        createdAt: chat.createdAt,
        lastMessageAt: chat.lastMessageAt,
      },
      messages,
    });
  } catch (error: any) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { error: error.message || '取得聊天室失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const { chatId } = await params;
    await connectDB();

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

    // 刪除聊天室和所有訊息
    await Message.deleteMany({ chatId: chatId });
    await Chat.findByIdAndDelete(chatId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: error.message || '刪除聊天室失敗' },
      { status: 500 }
    );
  }
}

