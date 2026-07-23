import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin-guard"
import { createNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const { reason } = body as { reason?: string }

  const target = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await createNotification({
    userId: id,
    type: "general",
    title: "Community Warning",
    body: reason || "Your account has received a warning from an administrator for violating community guidelines.",
    fromUserId: auth.userId,
  })

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: "warn_user",
      targetId: id,
      details: { name: target.name, reason: reason || "Community guidelines violation" },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json({ success: true })
}
