import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/posts/:postId/like
// 匿名按讚 / 取消讚（toggle）
export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { user: authUser } = authResult

  const postId = params.postId

  try {
    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { id: true },
      })
      if (!post) {
        throw new Error('Post not found')
      }

      const existing = await tx.postLike.findUnique({
        where: {
          userId_postId: {
            userId: authUser.id,
            postId,
          },
        },
      })

      let hasLiked: boolean
      let likeCount: number

      if (existing) {
        // 取消讚
        await tx.postLike.delete({ where: { id: existing.id } })
        const updated = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        })
        hasLiked = false
        likeCount = updated.likeCount
      } else {
        // 新增讚
        await tx.postLike.create({
          data: {
            userId: authUser.id,
            postId,
          },
        })
        const updated = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        })
        hasLiked = true
        likeCount = updated.likeCount
      }

      return { hasLiked, likeCount }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Toggle like error:', error)
    if (error.message === 'Post not found') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

