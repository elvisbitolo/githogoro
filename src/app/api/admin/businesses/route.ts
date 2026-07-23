import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function GET() {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { name: true } },
        owner: { select: { name: true } },
        _count: { select: { reviews: true } },
      },
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error("GET /api/admin/businesses error:", error)
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}
