import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';

// 自動刪除邏輯：超過 7 天無對話且非朋友則刪除
export async function POST(req: NextRequest) {
  try {
    // 檢查是否有授權（可以設置一個 secret token）
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 找出超過 7 天沒有訊息且非朋友的聊天室
    const chatsToDelete = await Chat.find({
      isFriend: false,
      lastMessageAt: { $lt: sevenDaysAgo },
      status: 'active',
    });

    let deletedCount = 0;

    for (const chat of chatsToDelete) {
      // 刪除所有訊息
      await Message.deleteMany({ chatId: chat._id });
      // 刪除聊天室
      await Chat.findByIdAndDelete(chat._id);
      deletedCount++;
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `已刪除 ${deletedCount} 個聊天室`,
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || '清理失敗' },
      { status: 500 }
    );
  }
}




