import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const matches = await prisma.match.findMany({
      where: { status: 'matched' },
      select: { userId: true, matchedUserId: true },
    })

    const counts = new Map<string, number>()
    matches.forEach((m) => {
      counts.set(m.userId, (counts.get(m.userId) || 0) + 1)
      counts.set(m.matchedUserId, (counts.get(m.matchedUserId) || 0) + 1)
    })

    const topIds = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id)

    if (topIds.length === 0) {
      return NextResponse.json({ users: [] })
    }

    const users = await prisma.user.findMany({
      where: { id: { in: topIds } },
      select: {
        id: true,
        userId: true,
        name: true,
        bio: true,
        photos: {
          orderBy: [{ isCover: 'desc' }, { order: 'asc' }],
          take: 1,
          select: { url: true, blurLevel: true },
        },
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))
    const result = topIds
      .map((id) => {
        const u = userMap.get(id)
        if (!u) return null
        const photo = u.photos[0] || null
        return {
          id: u.id,
          userId: u.userId,
          name: u.name,
          bio: u.bio,
          matchCount: counts.get(id) || 0,
          photoUrl: photo?.url || null,
          blurLevel: photo?.blurLevel ?? 80,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ users: result })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
  }
}

