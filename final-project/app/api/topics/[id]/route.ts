import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/topics/[id] - 取得單一主題資訊
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
    })
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    const postCount = await prisma.post.count({ where: { boardId: topic.id } })
    return NextResponse.json({
      topic: {
        ...topic,
        postCount,
      },
    })
  } catch (error) {
    console.error('Get topic detail error:', error)
    return NextResponse.json({ error: 'Failed to get topic' }, { status: 500 })
  }
}
