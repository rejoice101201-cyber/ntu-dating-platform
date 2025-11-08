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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get original posts
    const originalPosts = await db.post.findMany({
      where: {
        authorId: routeUserId,
        parentId: null,
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

    // Get reposted posts
    const reposts = await db.repost.findMany({
      where: {
        userId: routeUserId,
      },
      include: {
        post: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Combine and sort by createdAt (use repostedAt for reposts)
    const repostedPosts = reposts.map((r) => ({
      ...r.post,
      repostedAt: r.createdAt,
      isRepost: true,
      repostedBy: {
        id: user.id,
        userID: user.userID,
        name: user.name,
        image: user.image,
      },
    }))

    // Filter out original posts that have been reposted (to avoid duplicates)
    // If a user reposts their own original post, we only show the repost version
    const repostedPostIds = new Set(repostedPosts.map((p) => p.id))
    const uniqueOriginalPosts = originalPosts
      .filter((p) => !repostedPostIds.has(p.id))
      .map((p) => ({ ...p, isRepost: false }))

    const allPosts = [
      ...uniqueOriginalPosts,
      ...repostedPosts,
    ].sort((a, b) => {
      const dateA = a.isRepost ? (a as any).repostedAt : a.createdAt
      const dateB = b.isRepost ? (b as any).repostedAt : b.createdAt
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    // Check which posts are liked/reposted by current user
    if (userId) {
      const postIds = allPosts.map((p) => p.id)
      const [likes, userReposts] = await Promise.all([
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
      const repostedPostIds = new Set(userReposts.map((r) => r.postId))

      const postsWithStatus = allPosts.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        isReposted: repostedPostIds.has(post.id),
      }))

      return NextResponse.json({ posts: postsWithStatus })
    }

    return NextResponse.json({ posts: allPosts })
  } catch (error) {
    console.error("Failed to fetch user posts:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

