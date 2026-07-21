import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

const PAGE_SIZE = 30

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || String(PAGE_SIZE)), 50)
    const unreadOnly = searchParams.get("unread") === "true"

    const where: any = { userId: user.id }
    if (unreadOnly) where.isRead = false
    if (cursor) {
      const cursorNotification = await prisma.notification.findUnique({ where: { id: cursor } })
      if (cursorNotification) {
        where.createdAt = { lt: cursorNotification.createdAt }
      }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    })

    const hasMore = notifications.length > limit
    const items = hasMore ? notifications.slice(0, limit) : notifications
    const nextCursor = hasMore ? items[items.length - 1].id : null

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    })

    return NextResponse.json({ notifications: items, nextCursor, hasMore, unreadCount })
  } catch (error) {
    console.error("GET /api/notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
