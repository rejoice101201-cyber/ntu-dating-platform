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
            likes: {
              where: { userId: authUser.id },
              select: { id: true },
            },
            _count: {
              select: { likes: true },
            },
          },
        },
      },
    })

    // 取得所有收藏貼文的作者 ID，用於查詢配對狀態
    const authorIds = favorites
      .filter((fav) => fav.post && fav.post.authorId !== authUser.id)
      .map((fav) => fav.post!.authorId)

    // 批量查詢配對狀態（雙向檢查）
    const matches = authorIds.length > 0
      ? await prisma.match.findMany({
          where: {
            OR: [
              {
                userId: authUser.id,
                matchedUserId: { in: authorIds },
                status: 'matched',
              },
              {
                userId: { in: authorIds },
                matchedUserId: authUser.id,
                status: 'matched',
              },
            ],
          },
          select: {
            id: true,
            userId: true,
            matchedUserId: true,
          },
        })
      : []

    // 建立 authorId -> matchId 的映射
    const matchMap = new Map<string, string>()
    matches.forEach((m) => {
      const authorId = m.userId === authUser.id ? m.matchedUserId : m.userId
      matchMap.set(authorId, m.id)
    })

    // 格式化收藏列表，添加 likeCount、hasLiked、isMatched 和 matchId
    const formattedFavorites = favorites.map((fav) => {
      if (!fav.post) return fav
      
      const likeCount = fav.post._count.likes
      const hasLiked = fav.post.likes.length > 0
      
      // 檢查是否已配對（只對非自己的貼文檢查）
      const isMatched = fav.post.authorId !== authUser.id && matchMap.has(fav.post.authorId)
      const matchId = isMatched ? matchMap.get(fav.post.authorId) || null : null
      
      return {
        ...fav,
        post: {
          ...fav.post,
          likeCount,
          hasLiked,
          isMatched: !!isMatched,
          matchId,
        },
      }
    })

    return NextResponse.json({ favorites: formattedFavorites })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Failed to get favorites' },
      { status: 500 }
    )
  }
}

