import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// AI 柴犬教練建議
const OPENING_LINES = [
  "你好！我看到你們有共同的興趣，不如從 {interest} 開始聊起？",
  "🐕 柴犬建議：可以問問他/她關於 {tag} 的看法！",
  "試試這個開場白：'我注意到你喜歡 {tag}，我也是！'",
  "根據你們的匹配度，建議聊聊 {commonInterest}",
];

const TOPIC_SUGGESTIONS = [
  "聊聊你們共同的興趣",
  "分享最近看過的電影或書籍",
  "討論週末喜歡做什麼",
  "聊聊旅行經歷",
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
      return line.replace(/\{[^}]+\}/g, '某個話題');
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
      ...commonTags.slice(0, 3).map(ut => `聊聊關於 ${ut.tag.name} 的話題`),
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
        message: '🐕 建議上傳至少3張照片，讓更多人了解你！',
      });
    }

    if (!user.bio || user.bio.length < 50) {
      suggestions.push({
        type: 'bio',
        message: '🐕 寫一段更詳細的自我介紹，會提高匹配率哦！',
      });
    }

    if (user.tags.length < 5) {
      suggestions.push({
        type: 'tags',
        message: '🐕 新增更多興趣標籤，找到更多共同話題！',
      });
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Get profile suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;

