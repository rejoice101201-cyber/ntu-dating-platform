import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { email, provider, existingProvider } = await req.json()

    if (!email || !provider || !existingProvider) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Find existing user by email
    const existingUser = await db.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Check if provider is already linked
    const hasProvider = existingUser.accounts.some(
      (acc) => acc.provider === provider
    )

    if (hasProvider) {
      return NextResponse.json(
        { error: "This login method is already linked" },
        { status: 400 }
      )
    }

    // Store link request in sessionStorage (client-side) and proceed with OAuth
    // The actual linking will happen in signIn callback when OAuth completes
    // We'll use the callback URL pattern to detect link intent

    return NextResponse.json({
      success: true,
      message: "Account can be linked, please use the new login method to complete linking",
      userId: existingUser.id,
    })
  } catch (error) {
    console.error("Link account error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

