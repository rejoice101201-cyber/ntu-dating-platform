import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

// GET: Get all drafts for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const drafts = await db.draft.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error("Failed to fetch drafts:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

// POST: Create a new draft
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    const draft = await db.draft.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("Failed to create draft:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

// PUT: Update an existing draft
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, content } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    // Verify the draft belongs to the user
    const existingDraft = await db.draft.findUnique({
      where: { id },
    })

    if (!existingDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      )
    }

    if (existingDraft.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const draft = await db.draft.update({
      where: { id },
      data: {
        content: content.trim(),
      },
    })

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("Failed to update draft:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

// DELETE: Delete a draft
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      )
    }

    // Verify the draft belongs to the user
    const existingDraft = await db.draft.findUnique({
      where: { id },
    })

    if (!existingDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      )
    }

    if (existingDraft.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await db.draft.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete draft:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

