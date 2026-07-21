import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const where: Record<string, unknown> = {}

    if (type && type !== "all") {
      where.type = type
    }

    const alerts = await prisma.alert.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    })

    const result = alerts.map((alert) => ({
      ...alert,
      isRead: user ? alert.reads.length > 0 : false,
      reads: undefined,
    }))

    const unreadCount = user
      ? await prisma.alert.count({
          where: {
            reads: { none: { userId: user.id } },
          },
        })
      : 0

    return NextResponse.json({ alerts: result, unreadCount })
  } catch (error) {
    console.error("GET /api/alerts error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json()
    const { title, type, alertBody } = body

    if (!title || !alertBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    const alert = await prisma.alert.create({
      data: {
        title,
        type: type || "general",
        body: alertBody,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error("POST /api/alerts error:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}
