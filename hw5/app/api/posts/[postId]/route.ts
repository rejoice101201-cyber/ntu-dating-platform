import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const session = await auth()
    const userId = session?.user?.id

    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            userID: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            comments: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 })
    }

    // Check if liked/reposted
    let isLiked = false
    let isReposted = false

    if (userId) {
      const [like, repost] = await Promise.all([
        db.like.findUnique({
          where: {
            userId_postId: {
              userId,
              postId: post.id,
            },
          },
        }),
        db.repost.findUnique({
          where: {
            userId_postId: {
              userId,
              postId: post.id,
            },
          },
        }),
      ])
      isLiked = !!like
      isReposted = !!repost
    }

    return NextResponse.json({
      post: {
        ...post,
        isLiked,
        isReposted,
      },
    })
  } catch (error) {
    console.error("Failed to fetch post:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true, parentId: true },
    })

    if (!post) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Can't delete reposts (posts with parentId that aren't authored by you)
    if (post.parentId) {
      const parentPost = await db.post.findUnique({
        where: { id: post.parentId },
        select: { authorId: true },
      })
      if (parentPost && parentPost.authorId !== session.user.id) {
        return NextResponse.json(
          { error: "Cannot delete reposted post" },
          { status: 400 }
        )
      }
    }

    await db.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete post:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

