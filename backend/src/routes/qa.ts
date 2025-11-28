import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Get questions for Q&A game
router.get('/questions', authenticate, async (req: AuthRequest, res) => {
  try {
    const { category, limit = 5 } = req.query;

    const questions = await prisma.question.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as string }),
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Submit answer
router.post('/answer', authenticate, async (req: AuthRequest, res) => {
  try {
    const answerSchema = z.object({
      questionId: z.string(),
      answer: z.string(),
    });

    const data = answerSchema.parse(req.body);

    // Check energy
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { energy: true },
    });

    if (!user || user.energy < 3) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    const answer = await prisma.qaAnswer.upsert({
      where: {
        userId_questionId: {
          userId: req.userId!,
          questionId: data.questionId,
        },
      },
      create: {
        userId: req.userId!,
        questionId: data.questionId,
        answer: data.answer,
      },
      update: {
        answer: data.answer,
      },
    });

    // Deduct energy
    await prisma.user.update({
      where: { id: req.userId },
      data: { energy: { decrement: 3 } },
    });

    res.json({ answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Play Q&A game with another user
router.post('/play/:targetUserId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { targetUserId } = req.params;
    const { questionIds, answers } = req.body;

    if (!Array.isArray(questionIds) || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid game data' });
    }

    // Check energy
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { energy: true },
    });

    if (!user || user.energy < 10) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    // Get target user's answers
    const targetAnswers = await prisma.qaAnswer.findMany({
      where: {
        userId: targetUserId,
        questionId: { in: questionIds },
      },
    });

    // Compare answers and calculate match
    let matchingAnswers = 0;
    questionIds.forEach((qId: string, index: number) => {
      const targetAnswer = targetAnswers.find(ta => ta.questionId === qId);
      if (targetAnswer && targetAnswer.answer === answers[index]) {
        matchingAnswers++;
      }
    });

    const matchPercentage = (matchingAnswers / questionIds.length) * 100;

    // Update unlock progress
    const unlockProgress = await prisma.unlockProgress.upsert({
      where: {
        userId_targetUserId: {
          userId: req.userId!,
          targetUserId,
        },
      },
      create: {
        userId: req.userId!,
        targetUserId,
        qaCompleted: questionIds.length,
        unlockLevel: Math.min(100, Math.floor(matchPercentage)),
        interactionCount: { increment: 1 },
      },
      update: {
        qaCompleted: { increment: questionIds.length },
        unlockLevel: Math.min(100, Math.floor(matchPercentage)),
        interactionCount: { increment: 1 },
      },
    });

    // Deduct energy
    await prisma.user.update({
      where: { id: req.userId },
      data: { energy: { decrement: 10 } },
    });

    res.json({
      matchPercentage: Math.round(matchPercentage),
      matchingAnswers,
      totalQuestions: questionIds.length,
      unlockProgress,
    });
  } catch (error) {
    console.error('Play Q&A error:', error);
    res.status(500).json({ error: 'Failed to play Q&A game' });
  }
});

export default router;

