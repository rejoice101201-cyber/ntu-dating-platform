import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: routeUserId } = await params
    const session = await auth()
    const userId = session?.user?.id

    const user = await db.user.findUnique({
      where: { id: routeUserId },
    })

    if (!user) {
      return NextResponse.json({ error: "使用者不存在" }, { status: 404 })
    }

    const posts = await db.post.findMany({
      where: {
        authorId: routeUserId,
        parentId: null, // Only original posts, not reposts
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
      orderBy: {
        createdAt: "desc",
      },
    })

    // Check which posts are liked/reposted by current user
    if (userId) {
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
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Failed to fetch user posts:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

