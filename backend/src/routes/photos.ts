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

// Delete photo
router.delete('/:photoId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { photoId } = req.params;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Only allow user to delete their own photos
    if (photo.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this photo' });
    }

    // Delete file from filesystem
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Extract filename from URL (e.g., /uploads/userId/filename.jpg)
    const urlParts = photo.url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];
    const filepath = path.join(__dirname, '../../uploads', userId, filename);
    
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (fileError) {
      console.error('Failed to delete file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;

