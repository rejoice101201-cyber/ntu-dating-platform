import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { calculatePostLength } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filter = searchParams.get("filter") || "all"
    const userId = session.user.id

    let whereClause: any = {
      parentId: null, // Only show top-level posts
    }

    if (filter === "following") {
      // Get IDs of users being followed
      const following = await db.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
      const followingIds = following.map((f) => f.followingId)
      whereClause.authorId = { in: followingIds }
    }

    const posts = await db.post.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Check which posts are liked/reposted by current user
    const postIds = posts.map((p) => p.id)
    const [likes, reposts] = await Promise.all([
      db.like.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: { postId: true },
      }),
      db.repost.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: { postId: true },
      }),
    ])

    const likedPostIds = new Set(likes.map((l) => l.postId))
    const repostedPostIds = new Set(reposts.map((r) => r.postId))

    const postsWithStatus = posts.map((post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
      isReposted: repostedPostIds.has(post.id),
    }))

    return NextResponse.json({ posts: postsWithStatus })
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, parentId } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    const postLength = calculatePostLength(content)
    if (postLength > 280) {
      return NextResponse.json(
        { error: "Post length exceeds 280 character limit" },
        { status: 400 }
      )
    }

    const post = await db.post.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        parentId: parentId || null,
      },
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

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Failed to create post:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

