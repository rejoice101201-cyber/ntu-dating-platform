import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import sharp from 'sharp';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get user profile
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const viewerId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get unlock progress if viewing other user's profile
    let unlockProgress = null;
    if (userId !== viewerId) {
      unlockProgress = await prisma.unlockProgress.findUnique({
        where: {
          userId_targetUserId: {
            userId: viewerId!,
            targetUserId: userId,
          },
        },
      });
    }

    // Apply blur to photos based on unlock progress
    const photos = user.photos.map(photo => {
      if (userId === viewerId) {
        return { ...photo, blurLevel: 0 }; // Own photos are never blurred
      }

      const progress = unlockProgress?.unlockLevel || 0;
      const effectiveBlur = Math.max(0, photo.blurLevel - progress);
      
      return {
        ...photo,
        blurLevel: effectiveBlur,
      };
    });

    const { password, ...userWithoutPassword } = user;

    res.json({
      ...userWithoutPassword,
      photos,
      unlockProgress,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      bio: z.string().optional(),
      location: z.string().optional(),
      height: z.number().optional(),
    });

    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        location: true,
        height: true,
        birthday: true,
        gender: true,
        energy: true,
        energyMax: true,
      },
    });

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Upload photo
router.post('/me/photos', authenticate, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    // Process image with sharp (blur, resize, etc.)
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // In production, upload to S3 or similar
    // For now, we'll store the URL (you'd upload to cloud storage)
    const photoUrl = `/uploads/${req.userId}/${Date.now()}.jpg`;

    // Get current photo count to set order
    const photoCount = await prisma.photo.count({
      where: { userId: req.userId },
    });

    const photo = await prisma.photo.create({
      data: {
        userId: req.userId!,
        url: photoUrl,
        blurLevel: 100, // Fully blurred by default
        order: photoCount,
        isCover: photoCount === 0, // First photo is cover
      },
    });

    res.status(201).json({ photo });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Add tags to user
router.post('/me/tags', authenticate, async (req: AuthRequest, res) => {
  try {
    const { tagIds } = req.body;

    if (!Array.isArray(tagIds)) {
      return res.status(400).json({ error: 'tagIds must be an array' });
    }

    // Create tags if they don't exist, or use existing ones
    const userTags = await Promise.all(
      tagIds.map(async (tagId: string) => {
        return prisma.userTag.upsert({
          where: {
            userId_tagId: {
              userId: req.userId!,
              tagId,
            },
          },
          create: {
            userId: req.userId!,
            tagId,
          },
          update: {},
        });
      })
    );

    res.json({ tags: userTags });
  } catch (error) {
    console.error('Add tags error:', error);
    res.status(500).json({ error: 'Failed to add tags' });
  }
});

// Get user energy
router.get('/me/energy', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        energy: true,
        energyMax: true,
        lastEnergyRefill: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate energy refill (e.g., 1 energy per hour, max 100)
    const now = new Date();
    const hoursSinceRefill = (now.getTime() - user.lastEnergyRefill.getTime()) / (1000 * 60 * 60);
    const energyToAdd = Math.floor(hoursSinceRefill);
    const newEnergy = Math.min(user.energyMax, user.energy + energyToAdd);

    if (newEnergy > user.energy) {
      await prisma.user.update({
        where: { id: req.userId },
        data: {
          energy: newEnergy,
          lastEnergyRefill: now,
        },
      });
    }

    res.json({
      energy: newEnergy,
      energyMax: user.energyMax,
      lastRefill: user.lastEnergyRefill,
    });
  } catch (error) {
    console.error('Get energy error:', error);
    res.status(500).json({ error: 'Failed to get energy' });
  }
});

export default router;

