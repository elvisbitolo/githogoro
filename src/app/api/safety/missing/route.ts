import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const missing = await prisma.missingPerson.findMany({
      where: { status: "active" },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(missing)
  } catch (error) {
    console.error("GET /api/safety/missing error:", error)
    return NextResponse.json({ error: "Failed to fetch missing persons" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, description, category, photo, location, contactPhone } = body

    const missing = await prisma.missingPerson.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        category,
        photo: photo || null,
        location: location || null,
        contactPhone,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(missing, { status: 201 })
  } catch (error) {
    console.error("POST /api/safety/missing error:", error)
    return NextResponse.json({ error: "Failed to create missing person alert" }, { status: 500 })
  }
}
