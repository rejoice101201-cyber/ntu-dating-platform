import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/favorites/:postId - 取消收藏當前使用者對該貼文的收藏
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { user: authUser } = authResult

  const postId = params.postId

  try {
    await prisma.favorite.deleteMany({
      where: {
        userId: authUser.id,
        postId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to delete favorite' },
      { status: 500 }
    )
  }
}

