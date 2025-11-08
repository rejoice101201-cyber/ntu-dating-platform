import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, bio } = await req.json()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name || null
    if (bio !== undefined) updateData.bio = bio || null

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        userID: true,
        name: true,
        bio: true,
        image: true,
        banner: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

