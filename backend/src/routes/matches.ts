import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get discovery/recommendations
router.get('/discover', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { limit = 10, offset = 0 } = req.query;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tags: {
          include: { tag: true },
        },
        matches: true,
        ratings: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's tag IDs
    const userTagIds = currentUser.tags.map(ut => ut.tagId);

    // Find users with common tags, different gender (if preference), not already matched
    const matchedUserIds = [
      ...currentUser.matches.map(m => m.matchedUserId),
      ...currentUser.ratings.map(r => r.ratedUserId),
    ];

    const recommendations = await prisma.user.findMany({
      where: {
        id: { not: userId },
        isActive: true,
        isVerified: true,
        id: { notIn: matchedUserIds },
        // Add more filters: gender preference, age range, location, etc.
      },
      include: {
        photos: {
          where: { isCover: true },
          take: 1,
        },
        tags: {
          include: { tag: true },
          take: 5,
        },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Calculate match score based on common tags
    const scoredRecommendations = recommendations.map(user => {
      const commonTags = user.tags.filter(ut => userTagIds.includes(ut.tagId));
      const matchScore = (commonTags.length / Math.max(userTagIds.length, user.tags.length)) * 100;

      return {
        ...user,
        matchScore: Math.round(matchScore),
        commonTags: commonTags.map(ut => ut.tag),
      };
    });

    // Sort by match score
    scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ recommendations: scoredRecommendations });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Rate a user
router.post('/rate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId: targetUserId, score } = req.body;

    if (!targetUserId || !score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    // Check energy
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { energy: true },
    });

    if (!user || user.energy < 5) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    // Create or update rating
    const rating = await prisma.rating.upsert({
      where: {
        userId_ratedUserId: {
          userId: req.userId!,
          ratedUserId: targetUserId,
        },
      },
      create: {
        userId: req.userId!,
        ratedUserId: targetUserId,
        score,
      },
      update: {
        score,
      },
    });

    // Check if both users rated each other
    const reverseRating = await prisma.rating.findUnique({
      where: {
        userId_ratedUserId: {
          userId: targetUserId,
          ratedUserId: req.userId!,
        },
      },
    });

    let match = null;
    if (reverseRating) {
      const totalScore = score + reverseRating.score;
      const MATCH_THRESHOLD = 7; // Both ratings sum to at least 7

      if (totalScore >= MATCH_THRESHOLD) {
        // Create or update match
        match = await prisma.match.upsert({
          where: {
            userId_matchedUserId: {
              userId: req.userId!,
              matchedUserId: targetUserId,
            },
          },
          create: {
            userId: req.userId!,
            matchedUserId: targetUserId,
            status: 'matched',
            totalScore,
            matchedAt: new Date(),
          },
          update: {
            status: 'matched',
            totalScore,
            matchedAt: new Date(),
          },
        });
      }
    }

    // Deduct energy
    await prisma.user.update({
      where: { id: req.userId },
      data: { energy: { decrement: 5 } },
    });

    res.json({ rating, match });
  } catch (error) {
    console.error('Rate error:', error);
    res.status(500).json({ error: 'Failed to rate user' });
  }
});

// Get matches
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userId: req.userId },
          { matchedUserId: req.userId },
        ],
        status: 'matched',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photos: {
              where: { isCover: true },
              take: 1,
            },
          },
        },
        matchedUser: {
          select: {
            id: true,
            name: true,
            photos: {
              where: { isCover: true },
              take: 1,
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { matchedAt: 'desc' },
    });

    // Format matches to show the other user
    const formattedMatches = matches.map(match => {
      const otherUser = match.userId === req.userId ? match.matchedUser : match.user;
      return {
        id: match.id,
        user: otherUser,
        matchedAt: match.matchedAt,
        lastMessage: match.messages[0] || null,
      };
    });

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

export default router;

