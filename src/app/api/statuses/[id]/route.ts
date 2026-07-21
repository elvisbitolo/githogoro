import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = await prisma.userStatus.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    })

    if (!status) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 })
    }

    if (new Date(status.expiresAt) < new Date()) {
      await prisma.userStatus.delete({ where: { id } })
      return NextResponse.json({ error: "Status expired" }, { status: 404 })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("GET /api/statuses/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = await prisma.userStatus.findUnique({
      where: { id },
    })

    if (!status) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 })
    }

    if (status.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.userStatus.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/statuses/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete status" }, { status: 500 })
  }
}
