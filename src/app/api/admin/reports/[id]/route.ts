import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyModerator } from "@/lib/admin-guard"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyModerator()
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!["pending", "reviewed", "actioned", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid report status" }, { status: 400 })
  }

  const existing = await prisma.report.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  const updated = await prisma.report.update({
    where: { id },
    data: {
      status,
      handledById: auth.userId,
      handledAt: new Date(),
    },
    include: {
      reporter: { select: { id: true, name: true } },
      handledBy: { select: { id: true, name: true } },
    },
  })

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: "handle_report",
      targetId: id,
      details: {
        status,
        targetType: existing.targetType,
        targetId: existing.targetId,
        reason: existing.reason.slice(0, 200),
      },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json(updated)
}
