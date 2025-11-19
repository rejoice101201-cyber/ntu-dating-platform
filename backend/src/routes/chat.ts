import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get messages for a match
router.get('/:matchId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { matchId } = req.params;

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userId: req.userId },
          { matchedUserId: req.userId },
        ],
        status: 'matched',
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
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
        senderId: { not: req.userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;

