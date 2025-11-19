import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pusher } from '@/lib/pusher';

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { matchId } = params;

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
  { params }: { params: { matchId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { matchId } = params;

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
    await pusher.trigger(`match-${matchId}`, 'new_message', {
      ...message,
      matchId, // Include matchId for filtering
    });
    await pusher.trigger(`user-${otherUserId}`, 'new_message', {
      ...message,
      matchId, // Include matchId for filtering
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

