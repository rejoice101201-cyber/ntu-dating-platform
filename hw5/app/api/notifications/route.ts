import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userId = session.user.id

    // Get user's post IDs (top-level posts only)
    const userPosts = await db.post.findMany({
      where: {
        authorId: userId,
        parentId: null,
      },
      select: { id: true },
    })
    const postIds = userPosts.map((p) => p.id)

    // Get user's comment IDs
    const userComments = await db.post.findMany({
      where: {
        authorId: userId,
        parentId: { not: null },
      },
      select: { id: true },
    })
    const commentIds = userComments.map((c) => c.id)

    // 1. Get reposts of user's posts
    const reposts = await db.repost.findMany({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            userID: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 2. Get likes on user's posts
    const postLikes = await db.like.findMany({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            userID: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 3. Get likes on user's comments
    const commentLikes = await db.like.findMany({
      where: {
        postId: { in: commentIds },
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            userID: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Combine all notifications
    const notifications = [
      ...reposts.map((repost) => ({
        id: repost.id,
        type: "repost" as const,
        user: repost.user,
        post: repost.post,
        createdAt: repost.createdAt,
      })),
      ...postLikes.map((like) => ({
        id: like.id,
        type: "like_post" as const,
        user: like.user,
        post: like.post,
        createdAt: like.createdAt,
      })),
      ...commentLikes.map((like) => ({
        id: like.id,
        type: "like_comment" as const,
        user: like.user,
        post: like.post,
        createdAt: like.createdAt,
      })),
    ]

    // Sort by createdAt (newest first)
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

