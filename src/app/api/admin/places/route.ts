import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const places = await prisma.communityPlace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        submitter: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(places)
  } catch (error) {
    console.error("GET /api/admin/places error:", error)
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 })
  }
}
