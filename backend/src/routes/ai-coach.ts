import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// AI 柴犬教练建议
const OPENING_LINES = [
  "你好！我看到你们有共同的兴趣，不如从 {interest} 开始聊起？",
  "🐕 柴犬建议：可以问问他/她关于 {tag} 的看法！",
  "试试这个开场白：'我注意到你喜欢 {tag}，我也是！'",
  "根据你们的匹配度，建议聊聊 {commonInterest}",
];

const TOPIC_SUGGESTIONS = [
  "聊聊你们共同的兴趣",
  "分享最近看过的电影或书籍",
  "讨论周末喜欢做什么",
  "聊聊旅行经历",
];

// Get opening line suggestions
router.get('/opening-lines/:targetUserId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { targetUserId } = req.params;

    // Get target user's tags
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current user's tags
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    // Find common tags
    const currentUserTagIds = currentUser?.tags.map(ut => ut.tagId) || [];
    const commonTags = targetUser.tags.filter(ut => currentUserTagIds.includes(ut.tagId));

    // Generate suggestions
    const suggestions = OPENING_LINES.map(line => {
      if (commonTags.length > 0) {
        const randomTag = commonTags[Math.floor(Math.random() * commonTags.length)];
        return line
          .replace('{interest}', randomTag.tag.name)
          .replace('{tag}', randomTag.tag.name)
          .replace('{commonInterest}', randomTag.tag.name);
      }
      return line.replace(/\{[^}]+\}/g, '某个话题');
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Get opening lines error:', error);
    res.status(500).json({ error: 'Failed to get opening lines' });
  }
});

// Get topic suggestions
router.get('/topics/:matchId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { matchId } = req.params;

    // Verify match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userId: req.userId },
          { matchedUserId: req.userId },
        ],
      },
      include: {
        user: {
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
        matchedUser: {
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const otherUser = match.userId === req.userId ? match.matchedUser : match.user;
    const currentUser = match.userId === req.userId ? match.user : match.matchedUser;

    // Find common interests
    const currentUserTagIds = currentUser.tags.map(ut => ut.tagId);
    const commonTags = otherUser.tags.filter(ut => currentUserTagIds.includes(ut.tagId));

    const suggestions = [
      ...TOPIC_SUGGESTIONS,
      ...commonTags.slice(0, 3).map(ut => `聊聊关于 ${ut.tag.name} 的话题`),
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// Get profile improvement suggestions
router.get('/profile-suggestions', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        photos: true,
        tags: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const suggestions = [];

    if (user.photos.length < 3) {
      suggestions.push({
        type: 'photo',
        message: '🐕 建议上传至少3张照片，让更多人了解你！',
      });
    }

    if (!user.bio || user.bio.length < 50) {
      suggestions.push({
        type: 'bio',
        message: '🐕 写一段更详细的自我介绍，会提高匹配率哦！',
      });
    }

    if (user.tags.length < 5) {
      suggestions.push({
        type: 'tags',
        message: '🐕 添加更多兴趣标签，找到更多共同话题！',
      });
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Get profile suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;

