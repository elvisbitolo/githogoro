import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  try {
    const body = await request.json()
    const { title, message, type } = body

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    const alertType = type === "emergency" ? "emergency" : "general"

    const alert = await prisma.alert.create({
      data: {
        title: title.trim(),
        body: message.trim(),
        type: alertType,
        createdBy: auth.userId,
      },
    })

    await prisma.adminAction.create({
      data: {
        adminId: auth.userId,
        action: "send_announcement",
        targetId: alert.id,
        details: { title: title.trim(), type: alertType },
        ipAddress: request.headers.get("x-forwarded-for") || null,
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/announcements error:", error)
    return NextResponse.json({ error: "Failed to send announcement" }, { status: 500 })
  }
}
