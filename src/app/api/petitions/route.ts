import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const petitions = await prisma.petition.findMany({
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        signatures: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(petitions)
  } catch (error) {
    console.error("GET /api/petitions error:", error)
    return NextResponse.json({ error: "Failed to fetch petitions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, category, target_signatures } = body

    const petition = await prisma.petition.create({
      data: {
        creatorId: user.id,
        title,
        description,
        category: category || null,
        targetSignatures: target_signatures ? Number(target_signatures) : 100,
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        signatures: true,
      },
    })
    return NextResponse.json(petition, { status: 201 })
  } catch (error) {
    console.error("POST /api/petitions error:", error)
    return NextResponse.json({ error: "Failed to create petition" }, { status: 500 })
  }
}
