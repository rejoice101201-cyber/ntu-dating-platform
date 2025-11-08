import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { isValidUserID } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { userID } = await req.json()

    if (!userID || !isValidUserID(userID)) {
      return NextResponse.json(
        { error: "userID 格式不正確：只能包含字母、數字和底線，長度 1-15 字元" },
        { status: 400 }
      )
    }

    // Check if userID is already taken
    const existingUser = await db.user.findUnique({
      where: { userID },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "此 userID 已被使用" },
        { status: 400 }
      )
    }

    // Check if user already has a userID
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { userID: true },
    })

    if (currentUser?.userID) {
      return NextResponse.json(
        { error: "You have already registered a userID" },
        { status: 400 }
      )
    }

    // Update user with userID
    await db.user.update({
      where: { id: session.user.id },
      data: { 
        userID,
        originalEmail: (session.user as any).originalEmail || session.user.email?.split('#')[0] || undefined,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

