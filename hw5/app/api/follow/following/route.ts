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

    // Get IDs of users being followed
    const following = await db.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
    
    const followingIds = following.map((f) => f.followingId)

    return NextResponse.json({ followingIds })
  } catch (error) {
    console.error("Failed to fetch following list:", error)
    return NextResponse.json(
      { error: "Failed to fetch following list" },
      { status: 500 }
    )
  }
}

