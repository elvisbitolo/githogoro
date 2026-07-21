import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const routes = await prisma.safeRoute.findMany({
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(routes)
  } catch (error) {
    console.error("GET /api/safety/routes error:", error)
    return NextResponse.json({ error: "Failed to fetch safe routes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { from, to, rating, timeOfDay, comment } = body

    if (!from || !to || !rating || !timeOfDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const route = await prisma.safeRoute.create({
      data: {
        userId: user.id,
        from,
        to,
        rating: Number(rating),
        timeOfDay,
        comment: comment || null,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error("POST /api/safety/routes error:", error)
    return NextResponse.json({ error: "Failed to create safe route" }, { status: 500 })
  }
}
