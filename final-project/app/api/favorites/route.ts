import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/favorites - 收藏貼文
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { user: authUser } = authResult

  try {
    const { postId } = await request.json()
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    // 確認貼文存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 檢查是否已收藏
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: authUser.id,
          postId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { favorite: existing, existed: true },
        { status: 200 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: authUser.id,
        postId,
      },
    })

    return NextResponse.json(
      { favorite, existed: false },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to create favorite' },
      { status: 500 }
    )
  }
}

// GET /api/favorites - 取得目前使用者的收藏貼文
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { user: authUser } = authResult

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: {
              select: { id: true, name: true },
            },
            topic: {
              select: { id: true, title: true },
            },
            board: {
              select: { id: true, title: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Failed to get favorites' },
      { status: 500 }
    )
  }
}

