import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where: Record<string, unknown> = {}
    if (type && type !== "all") {
      where.type = type
    }

    const entries = await prisma.communityBudget.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("GET /api/governance/budget error:", error)
    return NextResponse.json({ error: "Failed to fetch budget entries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, type, amount, description, date } = body

    if (!title || !type || amount === undefined) {
      return NextResponse.json({ error: "Title, type, and amount are required" }, { status: 400 })
    }

    const entry = await prisma.communityBudget.create({
      data: {
        userId: user.id,
        title,
        type,
        amount,
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("POST /api/governance/budget error:", error)
    return NextResponse.json({ error: "Failed to create budget entry" }, { status: 500 })
  }
}
