import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const opportunities = await prisma.volunteerOpportunity.findMany({
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { signups: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error("GET /api/governance/volunteer error:", error)
    return NextResponse.json({ error: "Failed to fetch volunteer opportunities" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, date, location, maxVolunteers } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const opportunity = await prisma.volunteerOpportunity.create({
      data: {
        creatorId: user.id,
        title,
        description: description || null,
        date: date ? new Date(date) : null,
        location: location || null,
        maxVolunteers: maxVolunteers || null,
      },
      include: {
        creator: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error("POST /api/governance/volunteer error:", error)
    return NextResponse.json({ error: "Failed to create volunteer opportunity" }, { status: 500 })
  }
}
