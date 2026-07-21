import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const meals = await prisma.mealShare.findMany({
      where: { isClaimed: false },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(meals)
  } catch (error) {
    console.error("GET /api/meals error:", error)
    return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, servings, location, available_until, photo } = body

    const meal = await prisma.mealShare.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        servings: servings ? Number(servings) : 1,
        location: location || null,
        availableUntil: available_until ? new Date(available_until) : null,
        photo: photo || null,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(meal, { status: 201 })
  } catch (error) {
    console.error("POST /api/meals error:", error)
    return NextResponse.json({ error: "Failed to share meal" }, { status: 500 })
  }
}
