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
  const body = await request.json()
  const { points, reason } = body

  if (points === undefined || typeof points !== "number") {
    return NextResponse.json({ error: "points must be a number" }, { status: 400 })
  }

  const target = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, name: true, reputationPoints: true, reputationScore: true },
  })
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const newPoints = Math.max(0, target.reputationPoints + points)
  const newScore = Math.max(0, target.reputationScore + points)

  const [updated] = await prisma.$transaction([
    prisma.profile.update({
      where: { id },
      data: {
        reputationPoints: newPoints,
        reputationScore: newScore,
      },
      select: { reputationPoints: true, reputationScore: true },
    }),
    prisma.reputationLog.create({
      data: {
        userId: id,
        action: "post_created" as any,
        points,
        description: reason || `Admin adjustment: ${points >= 0 ? "+" : ""}${points} points`,
      },
    }),
    prisma.adminAction.create({
      data: {
        adminId: auth.userId,
        action: "adjust_reputation",
        targetId: id,
        details: { name: target.name, adjustment: points, previousPoints: target.reputationPoints, newPoints },
        ipAddress: request.headers.get("x-forwarded-for") || null,
      },
    }),
  ])

  return NextResponse.json({
    reputationPoints: updated.reputationPoints,
    reputationScore: updated.reputationScore,
  })
}
