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

    // Get user's post IDs
    const userPosts = await db.post.findMany({
      where: {
        authorId: userId,
        parentId: null, // Only top-level posts
      },
      select: { id: true },
    })
    const postIds = userPosts.map((p) => p.id)

    // Get user's comment IDs
    const userComments = await db.post.findMany({
      where: {
        authorId: userId,
        parentId: { not: null }, // Only comments
      },
      select: { id: true },
    })
    const commentIds = userComments.map((c) => c.id)

    // Count notifications:
    // 1. Reposts of user's posts (excluding user's own reposts)
    const repostCount = await db.repost.count({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
      },
    })

    // 2. Likes on user's posts (excluding user's own likes)
    const postLikeCount = await db.like.count({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
      },
    })

    // 3. Likes on user's comments (excluding user's own likes)
    const commentLikeCount = await db.like.count({
      where: {
        postId: { in: commentIds },
        userId: { not: userId },
      },
    })

    const totalCount = repostCount + postLikeCount + commentLikeCount

    return NextResponse.json({ count: totalCount })
  } catch (error) {
    console.error("Failed to fetch notification count:", error)
    return NextResponse.json(
      { error: "Failed to fetch notification count" },
      { status: 500 }
    )
  }
}

