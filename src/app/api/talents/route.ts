import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const talents = await prisma.talentShowcase.findMany({
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(talents)
  } catch (error) {
    console.error("GET /api/talents error:", error)
    return NextResponse.json({ error: "Failed to fetch talents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, category, media_url } = body

    const talent = await prisma.talentShowcase.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        category,
        mediaUrl: media_url || null,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(talent, { status: 201 })
  } catch (error) {
    console.error("POST /api/talents error:", error)
    return NextResponse.json({ error: "Failed to share talent" }, { status: 500 })
  }
}
