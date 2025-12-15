import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helpers
const TRENDING_WINDOW_DAYS = 7

function normalizeTitle(title: string) {
  return title.trim()
}

// POST /api/topics - create or return existing by title (case-insensitive)
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { user: authUser } = authResult

  try {
    const { title } = await request.json()
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    const normalized = normalizeTitle(title)

    // find existing by case-insensitive match
    const existing = await prisma.topic.findFirst({
      where: {
        title: {
          equals: normalized,
          mode: 'insensitive',
        },
      },
    })
    if (existing) {
      const postCount = await prisma.post.count({ where: { boardId: existing.id } })
      return NextResponse.json({
        topic: {
          ...existing,
          postCount,
        },
        existed: true,
      })
    }

    const created = await prisma.topic.create({
      data: {
        title: normalized,
        createdBy: authUser.id,
      },
    })

    return NextResponse.json({
      topic: {
        ...created,
        postCount: 0,
      },
      existed: false,
    })
  } catch (error) {
    console.error('Create topic error:', error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}

// GET /api/topics?sort=trending|latest
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'trending'

    if (sort === 'latest') {
      const topics = await prisma.topic.findMany({
        orderBy: { lastActivityAt: 'desc' },
        take: 50,
      })

      const withCounts = await Promise.all(
        topics.map(async (t) => {
          const postCount = await prisma.post.count({ where: { boardId: t.id } })
          return { ...t, postCount }
        })
      )
      return NextResponse.json({ topics: withCounts })
    }

    // trending: recent 7d posts count, then lastActivityAt desc
    const since = new Date()
    since.setDate(since.getDate() - TRENDING_WINDOW_DAYS)

    // get counts in window
    const postsByTopic = await prisma.post.groupBy({
      by: ['boardId'],
      where: {
        boardId: { not: null },
        createdAt: { gte: since },
      },
      _count: true,
    })
    const countMap = new Map<string, number>()
    postsByTopic.forEach((p) => {
      if (p.boardId) countMap.set(p.boardId, p._count)
    })

    const topics = await prisma.topic.findMany({
      orderBy: { lastActivityAt: 'desc' },
      take: 50,
    })

    const withCounts = await Promise.all(
      topics.map(async (t) => {
        const postCount = await prisma.post.count({ where: { boardId: t.id } })
        return {
          ...t,
          postCount,
          windowCount: countMap.get(t.id) || 0,
        }
      })
    )

    // sort by windowCount desc then lastActivityAt desc
    withCounts.sort((a, b) => {
      if (b.windowCount !== a.windowCount) return b.windowCount - a.windowCount
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    })

    return NextResponse.json({
      topics: withCounts.map(({ windowCount, ...rest }) => rest),
    })
  } catch (error) {
    console.error('Get topics error:', error)
    return NextResponse.json({ error: 'Failed to get topics' }, { status: 500 })
  }
}
