import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const memories = await prisma.photoMemory.findMany({
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(memories)
  } catch (error) {
    console.error("GET /api/photo-memories error:", error)
    return NextResponse.json({ error: "Failed to fetch photo memories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, photo_url, year } = body

    const memory = await prisma.photoMemory.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        photoUrl: photo_url,
        year: year ? Number(year) : null,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(memory, { status: 201 })
  } catch (error) {
    console.error("POST /api/photo-memories error:", error)
    return NextResponse.json({ error: "Failed to share memory" }, { status: 500 })
  }
}
