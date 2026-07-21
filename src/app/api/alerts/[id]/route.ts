import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        ...(user
          ? {
              reads: {
                where: { userId: user.id },
                select: { readAt: true },
              },
            }
          : {}),
      },
    })

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    const result = {
      ...alert,
      isRead: user ? alert.reads.length > 0 : false,
      reads: undefined,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/alerts/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch alert" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existing = await prisma.alert.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    await prisma.alert.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/alerts/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 })
  }
}
