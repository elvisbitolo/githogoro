import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tips = await prisma.healthTip.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(tips)
  } catch (error) {
    console.error("GET /api/health/tips error:", error)
    return NextResponse.json({ error: "Failed to fetch health tips" }, { status: 500 })
  }
}
