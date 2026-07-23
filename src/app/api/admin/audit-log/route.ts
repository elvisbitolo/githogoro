import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200)
    const action = searchParams.get("action")

    const where: Record<string, unknown> = {}
    if (action) where.action = action

    const actions = await prisma.adminAction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        targetId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        admin: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(actions)
  } catch (error) {
    console.error("GET /api/admin/audit-log error:", error)
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 })
  }
}
