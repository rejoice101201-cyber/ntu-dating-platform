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

    // Only allow viewing own likes
    if (userId !== routeUserId) {
      return NextResponse.json({ error: "無權限" }, { status: 403 })
    }

    const likes = await db.like.findMany({
      where: { userId: routeUserId },
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
      take: 50,
    })

    const posts = likes.map((like) => ({
      ...like.post,
      isLiked: true,
      isReposted: false, // TODO: Check if reposted
    }))

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Failed to fetch user likes:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

