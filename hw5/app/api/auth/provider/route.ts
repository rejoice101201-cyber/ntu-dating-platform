import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/auth/provider?userID=xxx
// Return the OAuth provider bound to this userID so the client can call signIn(provider)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userID = (searchParams.get("userID") || "").trim()

    if (!userID) {
      return NextResponse.json({ error: "缺少 userID" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { userID },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "This userID does not exist" }, { status: 404 })
    }

    // Find the first (and only) linked provider for this user
    const account = await db.account.findFirst({
      where: { userId: user.id },
      select: { provider: true },
    })

    if (!account) {
      return NextResponse.json({ error: "This userID has not been set up with a login method, please register again" }, { status: 400 })
    }

    return NextResponse.json({ provider: account.provider })
  } catch (err) {
    console.error("/api/auth/provider error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


