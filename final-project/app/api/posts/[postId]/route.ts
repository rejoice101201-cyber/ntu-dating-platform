import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH: 更新貼文內容（僅作者）
export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { user: authUser } = authResult

  const postId = params.postId

  try {
    const body = await request.json()
    const content = (body.content || '').trim()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existing.authorId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
        topic: {
          select: { id: true, title: true },
        },
      },
    })

    return NextResponse.json({
      post: {
        id: updated.id,
        authorId: updated.authorId,
        author: {
          id: updated.author.id,
          name: updated.author.name,
        },
        content: updated.content,
        imageUrl: updated.imageUrl,
        type: updated.type,
        topicId: updated.topicId,
        topic: updated.topic
          ? {
              id: updated.topic.id,
              title: updated.topic.title,
            }
          : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE: 刪除貼文（僅作者）
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { user: authUser } = authResult

  const postId = params.postId

  try {
    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existing.authorId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
