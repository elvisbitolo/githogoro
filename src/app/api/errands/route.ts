import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const errands = await prisma.errand.findMany({
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true, zone: true } },
        accepter: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(errands)
  } catch (error) {
    console.error("GET /api/errands error:", error)
    return NextResponse.json({ error: "Failed to fetch errands" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, pickup_location, dropoff_location, tip, due_date } = body

    const errand = await prisma.errand.create({
      data: {
        creatorId: user.id,
        title,
        description: description || null,
        pickupLocation: pickup_location,
        dropoffLocation: dropoff_location || null,
        tip: tip ? Number(tip) : null,
        dueDate: due_date ? new Date(due_date) : null,
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true, zone: true } },
      },
    })
    return NextResponse.json(errand, { status: 201 })
  } catch (error) {
    console.error("POST /api/errands error:", error)
    return NextResponse.json({ error: "Failed to create errand" }, { status: 500 })
  }
}
