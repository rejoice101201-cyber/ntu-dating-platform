import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 })
    }

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 })
    }

    // Check if already reposted
    const existingRepost = await db.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingRepost) {
      return NextResponse.json({ error: "Already reposted" }, { status: 400 })
    }

    // Create repost (as a new post with parentId)
    await db.repost.create({
      data: {
        userId: session.user.id,
        postId,
      },
    })

    // Get updated repost count
    const repostCount = await db.repost.count({
      where: { postId },
    })

    // Send Pusher notification
    try {
      await pusherServer.trigger(`post-${postId}`, "repost", {
        postId,
        repostCount,
        userId: session.user.id,
      })
    } catch (pusherError) {
      console.error("Pusher error:", pusherError)
    }

    return NextResponse.json({ success: true, repostCount })
  } catch (error) {
    console.error("Failed to repost:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 })
    }

    // Delete repost
    await db.repost.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    // Get updated repost count
    const repostCount = await db.repost.count({
      where: { postId },
    })

    // Send Pusher notification
    try {
      await pusherServer.trigger(`post-${postId}`, "repost", {
        postId,
        repostCount,
        userId: session.user.id,
      })
    } catch (pusherError) {
      console.error("Pusher error:", pusherError)
    }

    return NextResponse.json({ success: true, repostCount })
  } catch (error) {
    console.error("Failed to un-repost:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

