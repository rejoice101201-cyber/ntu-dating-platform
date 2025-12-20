import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPusher } from '@/lib/pusher';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> | { matchId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const resolvedParams = await Promise.resolve(params);
  const { matchId } = resolvedParams;

  try {
    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userId: authUser.id },
          { matchedUserId: authUser.id },
        ],
        status: 'matched',
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: authUser.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> | { matchId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const resolvedParams = await Promise.resolve(params);
  const { matchId } = resolvedParams;

  try {
    const body = await request.json();
    const { content, type = 'text' } = body;

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userId: authUser.id },
          { matchedUserId: authUser.id },
        ],
        status: 'matched',
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: authUser.id,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get other user ID
    const otherUserId = match.userId === authUser.id ? match.matchedUserId : match.userId;

    // Send via Pusher
    try {
      const pusher = getPusher();
      await pusher.trigger(`match-${matchId}`, 'new_message', {
        ...message,
        matchId, // Include matchId for filtering
      });
      await pusher.trigger(`user-${otherUserId}`, 'new_message', {
        ...message,
        matchId, // Include matchId for filtering
      });

      // Send unread count update via Pusher
      // 获取接收者的所有匹配的未读消息统计
      const allMatches = await prisma.match.findMany({
        where: {
          OR: [
            { userId: otherUserId },
            { matchedUserId: otherUserId },
          ],
          status: 'matched',
        },
        select: {
          id: true,
        },
      });

      const allMatchIds = allMatches.map(m => m.id);

      if (allMatchIds.length > 0) {
        // 统计每个匹配的未读消息数量
        const unreadMessages = await prisma.message.groupBy({
          by: ['matchId'],
          where: {
            matchId: { in: allMatchIds },
            senderId: { not: otherUserId }, // 只统计别人发给接收者的
            isRead: false,
          },
          _count: {
            id: true,
          },
        });

        // 转换为对象格式：{ matchId: count }
        const unreadCounts: Record<string, number> = {};
        let totalUnread = 0;

        unreadMessages.forEach((item) => {
          unreadCounts[item.matchId] = item._count.id;
          totalUnread += item._count.id;
        });

        // 推送未读消息更新给接收者
        await pusher.trigger(`user-${otherUserId}`, 'unread_messages_update', {
          unreadCounts,
          totalUnread,
        });
      }
    } catch (pusherError) {
      // If Pusher is not configured, log but don't fail the request
      console.warn('Pusher not configured, message saved but not broadcast:', pusherError);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

