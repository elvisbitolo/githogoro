import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { id } = await params

  if (auth.userId === id) {
    return NextResponse.json(
      { error: "You cannot ban your own account" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { banned, reason } = body

  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.profile.update({
    where: { id },
    data: {
      isBanned: !!banned,
      banReason: banned ? (reason?.trim() || null) : null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: id,
      type: "general",
      title: banned ? "Account Suspended" : "Account Restored",
      body: banned
        ? `Your account has been suspended${reason?.trim() ? `: ${reason.trim()}` : "."}`
        : "Your account has been restored.",
      entityType: "profile",
      entityId: id,
    },
  })

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: banned ? "ban_user" : "unban_user",
      targetId: id,
      details: { name: profile.name, reason: reason?.trim() || null },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json({ success: true, banned: !!banned })
}
