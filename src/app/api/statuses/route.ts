import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    await prisma.userStatus.deleteMany({
      where: { expiresAt: { lt: now } },
    })

    const statuses = await prisma.userStatus.findMany({
      where: { expiresAt: { gt: now } },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(statuses)
  } catch (error) {
    console.error("GET /api/statuses error:", error)
    return NextResponse.json({ error: "Failed to fetch statuses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, mediaUrl } = body

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: "Content or mediaUrl required" }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const status = await prisma.userStatus.create({
      data: {
        userId: user.id,
        content: content || "",
        mediaUrl: mediaUrl || null,
        expiresAt,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    })

    return NextResponse.json(status, { status: 201 })
  } catch (error) {
    console.error("POST /api/statuses error:", error)
    return NextResponse.json({ error: "Failed to create status" }, { status: 500 })
  }
}
