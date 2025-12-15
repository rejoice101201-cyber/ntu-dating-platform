import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { getTodayInTaiwan } from '@/lib/dateUtils';

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

// GET: 取得所有貼文（按時間倒序）
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

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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

    // 檢查每個貼文作者是否與當前用戶配對
    const postsWithMatchStatus = await Promise.all(
      posts.map(async (post: any) => {
        // 如果是自己的貼文，直接顯示姓名
        if (post.authorId === authUser.id) {
          return {
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
            boardId: post.boardId,
            board: post.board ? { id: post.board.id, title: post.board.title } : null,
            createdAt: post.createdAt.toISOString(),
            isMatched: true, // 自己的貼文視為已配對
            isAuthor: true,
          };
        }

        // 檢查是否已配對（雙向檢查）
        const match = await prisma.match.findFirst({
          where: {
            OR: [
              {
                userId: authUser.id,
                matchedUserId: post.authorId,
                status: 'matched',
              },
              {
                userId: post.authorId,
                matchedUserId: authUser.id,
                status: 'matched',
              },
            ],
          },
        });

        const isMatched = !!match;

        return {
          id: post.id,
          authorId: post.authorId,
          author: {
            id: post.author.id,
            // Phase 3: 未配對時隱藏姓名
            name: isMatched ? post.author.name : null,
          },
          content: post.content,
          imageUrl: post.imageUrl,
          type: post.type,
          topicId: post.topicId,
          topic: post.topic ? {
            id: post.topic.id,
            title: post.topic.title,
          } : null,
          boardId: post.boardId,
          board: post.board ? { id: post.board.id, title: post.board.title } : null,
          createdAt: post.createdAt.toISOString(),
          isMatched,
          matchId: match?.id || null, // 用於聊天室入口
          isAuthor: false,
        };
      })
    );

    return NextResponse.json({
      posts: postsWithMatchStatus,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to get posts' },
      { status: 500 }
    );
  }
}

// POST: 建立新貼文（文字 + 可選圖片）
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const image = formData.get('image') as File | null;
    const topicId = formData.get('topicId') as string | null; // daily topic (old)
    const boardId = formData.get('boardId') as string | null; // user-created topic/board

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // 如果提供了每日主題 topicId，驗證主題是否存在
    let postType = 'FREE';
    if (topicId) {
      const topic = await prisma.dailyTopic.findUnique({
        where: { id: topicId },
      });
      
      if (!topic) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }
      
      // Phase 2: 檢查今天是否已經發過主題貼文（一天只能發一個主題貼文）
      // 取得台灣時間的今天日期
      const { start: today, end: todayEnd } = getTodayInTaiwan();

      const todayTopicPost = await prisma.post.findFirst({
        where: {
          authorId: authUser.id,
          type: 'TOPIC',
          createdAt: {
            gte: today,
            lte: todayEnd,
          },
        },
      });

      if (todayTopicPost) {
        return NextResponse.json(
          { 
            error: '今日主題貼文已發佈',
            message: '每天只能針對今日話題發文一次',
            limitReached: true,
          },
          { status: 429 }
        );
      }
      
      postType = 'TOPIC';
    }

    // 如果提供 boardId，驗證存在
    if (boardId) {
      const board = await prisma.topic.findUnique({
        where: { id: boardId },
      });
      if (!board) {
        return NextResponse.json(
          { error: 'Board (topic) not found' },
          { status: 404 }
        );
      }
    }

    let imageUrl: string | null = null;

    // 處理圖片上傳（如果有的話）
    if (image && image.size > 0) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { error: 'Blob storage not configured' },
          { status: 500 }
        );
      }

      try {
        // 處理圖片
        const buffer = Buffer.from(await image.arrayBuffer());
        const sharpInstance = await getSharp();
        const processedBuffer = await sharpInstance(buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        // 上傳到 Vercel Blob
        const blob = await put(
          `posts/${authUser.id}/${Date.now()}.jpg`,
          processedBuffer,
          {
            access: 'public',
            contentType: 'image/jpeg',
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }
        );

        imageUrl = blob.url;
      } catch (imageError) {
        console.error('Image upload error:', imageError);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // 建立 Post
    const post = await prisma.post.create({
      data: {
        authorId: authUser.id,
        content: content.trim(),
        imageUrl: imageUrl,
        type: postType,
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
        topic: topicId ? {
          select: {
            id: true,
            title: true,
          },
        } : undefined,
        board: boardId ? {
          select: {
            id: true,
            title: true,
          },
        } : undefined,
      },
    });

    if (boardId) {
      await prisma.topic.update({
        where: { id: boardId },
        data: { lastActivityAt: new Date() },
      });
    }

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
        boardId: post.boardId,
        board: post.board ? {
          id: post.board.id,
          title: post.board.title,
        } : null,
        createdAt: post.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

