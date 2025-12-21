import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { getTodayInTaiwan } from '@/lib/dateUtils';
import { applyDailyEnergyRefill, clampEnergy } from '@/lib/energy';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

// Lazy load sharp to handle platform-specific issues
let sharp: any;
async function getSharp() {
  if (!sharp) {
    try {
      sharp = (await import('sharp')).default;
    } catch (error) {
      console.error('Failed to load sharp:', error);
      throw new Error('Image processing library not available');
    }
  }
  return sharp;
}

// Set runtime to nodejs for server-side execution
export const runtime = 'nodejs';

// GET: 取得所有貼文（支援排序與篩選）
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // 支援 topicId (每日主題) / boardId (使用者自定主題) 查詢參數
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const authorId = searchParams.get('authorId');
    const boardId = searchParams.get('boardId');
    const sort = (searchParams.get('sort') || 'latest') as 'latest' | 'trending';

    const whereClause: any = {};
    if (topicId) {
      whereClause.topicId = topicId;
    }
    if (authorId) {
      whereClause.authorId = authorId;
    }
    if (boardId) {
      whereClause.boardId = boardId;
    }
    // trending 僅包含最近 7 天的貼文
    if (sort === 'trending') {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      whereClause.createdAt = { gte: since };
    }

    // 使用重試機制執行查詢
    const posts = await withRetry(async () => {
      return await prisma.post.findMany({
        where: whereClause,
        orderBy: sort === 'latest'
          ? { createdAt: 'desc' as const }
          : [{ likeCount: 'desc' as const }, { createdAt: 'desc' as const }],
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
          board: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    });

    const postIds = posts.map((p: any) => p.id);
    
    // 使用重試機制查詢收藏和按讚狀態
    const [favorites, likes, matches] = await Promise.all([
      withRetry(async () => {
        return await prisma.favorite.findMany({
          where: {
            userId: authUser.id,
            postId: { in: postIds },
          },
          select: { postId: true },
        });
      }),
      withRetry(async () => {
        return await prisma.postLike.findMany({
          where: {
            userId: authUser.id,
            postId: { in: postIds },
          },
          select: { postId: true },
        });
      }),
      withRetry(async () => {
        return await prisma.match.findMany({
          where: {
            OR: [
              { userId: authUser.id, matchedUserId: { in: posts.map((p: any) => p.authorId).filter(Boolean) as string[] }, status: 'matched' },
              { matchedUserId: authUser.id, userId: { in: posts.map((p: any) => p.authorId).filter(Boolean) as string[] }, status: 'matched' },
            ],
          },
          select: { id: true, userId: true, matchedUserId: true },
        });
      }),
    ]);

    const favoriteSet = new Set(favorites.map((f: any) => f.postId));
    const likeSet = new Set(likes.map((l: any) => l.postId));
    const matchMap = new Map<string, { isMatched: boolean, matchId: string | null }>();

    posts.forEach((post: any) => {
      const authorId = post.authorId;
      const match = matches.find((m: any) => 
        (m.userId === authUser.id && m.matchedUserId === authorId) ||
        (m.matchedUserId === authUser.id && m.userId === authorId)
      );
      matchMap.set(post.id, { isMatched: !!match, matchId: match?.id || null });
    });

    // 計算每個貼文的按讚數
    const likeCounts = await withRetry(async () => {
      return await prisma.postLike.groupBy({
        by: ['postId'],
        where: { postId: { in: postIds } },
        _count: { id: true },
      });
    });

    const likeCountMap = new Map(likeCounts.map((lc: any) => [lc.postId, lc._count.id]));

    const formattedPosts = posts.map((post: any) => {
      const matchStatus = matchMap.get(post.id) || { isMatched: false, matchId: null };
      
      return {
        id: post.id,
        authorId: post.authorId,
        author: {
          id: post.author.id,
          name: matchStatus.isMatched ? post.author.name : (post.authorId === authUser.id ? post.author.name : null),
        },
        content: post.content,
        imageUrl: post.imageUrl,
        type: post.type,
        topicId: post.topicId,
        topic: post.topic ? {
          id: post.topic.id,
          title: post.topic.title,
        } : null,
        board: post.board ? {
          id: post.board.id,
          title: post.board.title,
        } : null,
        createdAt: post.createdAt.toISOString(),
        isFavorited: favoriteSet.has(post.id),
        likeCount: likeCountMap.get(post.id) || 0,
        hasLiked: likeSet.has(post.id),
        isMatched: matchStatus.isMatched,
        matchId: matchStatus.matchId,
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('Get posts error:', error);
    
    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}

// POST: 建立新貼文
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const formData = await request.formData();
    const content = (formData.get('content') as string)?.trim() || '';
    const image = formData.get('image') as File | null;
    const type = (formData.get('type') as string) || 'FREE';
    const topicId = formData.get('topicId') as string | null;
    const boardId = formData.get('boardId') as string | null;

    if (!content && !image) {
      return NextResponse.json(
        { error: 'Content or image is required' },
        { status: 400 }
      );
    }

    // Phase 2: 檢查是否為主題貼文，且今天是否已發過
    if (type === 'TOPIC' && topicId) {
      const { start: today, end: todayEnd } = getTodayInTaiwan();
      
      const todayTopicPost = await withRetry(async () => {
        return await prisma.post.findFirst({
          where: {
            authorId: authUser.id,
            type: 'TOPIC',
            topicId,
            createdAt: {
              gte: today,
              lte: todayEnd,
            },
          },
        });
      });

      if (todayTopicPost) {
        return NextResponse.json(
          { error: '今天已經發過這個主題的貼文了' },
          { status: 400 }
        );
      }
    }

    // 處理圖片上傳
    let imageUrl: string | null = null;
    if (image) {
      try {
        const sharpInstance = await getSharp();
        const imageBuffer = Buffer.from(await image.arrayBuffer());
        const processedImage = await sharpInstance(imageBuffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        const blob = await put(`posts/${Date.now()}-${image.name}`, processedImage, {
          access: 'public',
          contentType: 'image/jpeg',
        });
        imageUrl = blob.url;
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        return NextResponse.json(
          { error: 'Failed to process image' },
          { status: 500 }
        );
      }
    }

    // 使用重試機制建立貼文
    const post = await withRetry(async () => {
      return await prisma.post.create({
        data: {
          authorId: authUser.id,
          content,
          imageUrl,
          type: type as 'FREE' | 'TOPIC',
          topicId: topicId || null,
          boardId: boardId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
          board: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    });

    // 更新主題的最後活動時間
    if (topicId || boardId) {
      const targetId = boardId || topicId;
      if (targetId) {
        await withRetry(async () => {
          return await prisma.topic.update({
            where: { id: targetId },
            data: { lastActivityAt: new Date() },
          });
        }).catch(() => {
          // 忽略更新錯誤
        });
      }
    }

    // 扣除體力
    await applyDailyEnergyRefill(authUser.id);
    await withRetry(async () => {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { energy: true },
      });
      if (user && user.energy >= 5) {
        await prisma.user.update({
          where: { id: authUser.id },
          data: { energy: { decrement: 5 } },
        });
      }
    }).catch(() => {
      // 忽略體力扣除錯誤
    });

    return NextResponse.json({
      post: {
        id: post.id,
        authorId: post.authorId,
        author: {
          id: post.author.id,
          name: post.author.name,
        },
        content: post.content,
        imageUrl: post.imageUrl,
        type: post.type,
        topicId: post.topicId,
        topic: post.topic ? {
          id: post.topic.id,
          title: post.topic.title,
        } : null,
        board: post.board ? {
          id: post.board.id,
          title: post.board.title,
        } : null,
        createdAt: post.createdAt.toISOString(),
        isFavorited: false,
        likeCount: 0,
        hasLiked: false,
        isMatched: false,
        matchId: null,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create post error:', error);
    
    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}
