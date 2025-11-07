import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/users/list
// List all users with their userID and associated OAuth provider
export async function GET(req: NextRequest) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        userID: true,
        name: true,
        email: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const usersWithProvider = users.map((user) => ({
      userID: user.userID,
      name: user.name || "未設定",
      email: user.email || "未設定",
      provider: user.accounts[0]?.provider || "未知",
      createdAt: user.createdAt,
    }))

    return NextResponse.json({
      total: usersWithProvider.length,
      users: usersWithProvider,
    })
  } catch (err) {
    console.error("/api/users/list error", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

