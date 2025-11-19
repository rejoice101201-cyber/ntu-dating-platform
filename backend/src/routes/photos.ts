import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get photo with blur level based on unlock progress
router.get('/:photoId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { photoId } = req.params;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // If viewing own photo, no blur
    if (photo.userId === req.userId) {
      return res.json({ ...photo, blurLevel: 0 });
    }

    // Get unlock progress
    const unlockProgress = await prisma.unlockProgress.findUnique({
      where: {
        userId_targetUserId: {
          userId: req.userId!,
          targetUserId: photo.userId,
        },
      },
    });

    const effectiveBlur = unlockProgress
      ? Math.max(0, photo.blurLevel - unlockProgress.unlockLevel)
      : photo.blurLevel;

    res.json({
      ...photo,
      blurLevel: effectiveBlur,
    });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
});

export default router;

