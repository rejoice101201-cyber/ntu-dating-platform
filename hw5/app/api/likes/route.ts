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

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json({ error: "已經按過讚" }, { status: 400 })
    }

    // Create like
    await db.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
    })

    // Get updated like count
    const likeCount = await db.like.count({
      where: { postId },
    })

    // Send Pusher notification
    try {
      await pusherServer.trigger(`post-${postId}`, "like", {
        postId,
        likeCount,
        userId: session.user.id,
      })
    } catch (pusherError) {
      console.error("Pusher error:", pusherError)
    }

    return NextResponse.json({ success: true, likeCount })
  } catch (error) {
    console.error("Failed to like post:", error)
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

    // Delete like
    await db.like.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    // Get updated like count
    const likeCount = await db.like.count({
      where: { postId },
    })

    // Send Pusher notification
    try {
      await pusherServer.trigger(`post-${postId}`, "like", {
        postId,
        likeCount,
        userId: session.user.id,
      })
    } catch (pusherError) {
      console.error("Pusher error:", pusherError)
    }

    return NextResponse.json({ success: true, likeCount })
  } catch (error) {
    console.error("Failed to unlike post:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

