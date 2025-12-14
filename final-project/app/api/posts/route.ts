import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

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

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        authorId: post.authorId,
        author: {
          id: post.author.id,
          name: post.author.name,
        },
        content: post.content,
        imageUrl: post.imageUrl,
        type: post.type,
        createdAt: post.createdAt.toISOString(),
      })),
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

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
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
        type: 'FREE',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

