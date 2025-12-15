import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/topics/search?q=keyword
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()

    if (!q) {
      return NextResponse.json({ topics: [] })
    }

    const topics = await prisma.topic.findMany({
      where: {
        title: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: {
        lastActivityAt: 'desc',
      },
      take: 20,
    })

    const withCounts = await Promise.all(
      topics.map(async (t) => {
        const postCount = await prisma.post.count({ where: { boardId: t.id } })
        return { ...t, postCount }
      })
    )

    return NextResponse.json({ topics: withCounts })
  } catch (error) {
    console.error('Search topics error:', error)
    return NextResponse.json({ error: 'Failed to search topics' }, { status: 500 })
  }
}
