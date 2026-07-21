import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const obituaries = await prisma.obituary.findMany({
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        condolences: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(obituaries)
  } catch (error) {
    console.error("GET /api/obituaries error:", error)
    return NextResponse.json({ error: "Failed to fetch obituaries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, description, funeral_date, funeral_location, fund_goal, photo } = body

    const obituary = await prisma.obituary.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        funeralDate: funeral_date ? new Date(funeral_date) : null,
        funeralLocation: funeral_location || null,
        fundGoal: fund_goal ? Number(fund_goal) : null,
        photo: photo || null,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        condolences: true,
      },
    })
    return NextResponse.json(obituary, { status: 201 })
  } catch (error) {
    console.error("POST /api/obituaries error:", error)
    return NextResponse.json({ error: "Failed to post obituary" }, { status: 500 })
  }
}
