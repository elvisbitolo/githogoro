import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tools = await prisma.toolListing.findMany({
      where: { isAvailable: true },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(tools)
  } catch (error) {
    console.error("GET /api/tools error:", error)
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, description, photo, deposit } = body

    const tool = await prisma.toolListing.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        photo: photo || null,
        deposit: deposit ? Number(deposit) : null,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(tool, { status: 201 })
  } catch (error) {
    console.error("POST /api/tools error:", error)
    return NextResponse.json({ error: "Failed to list tool" }, { status: 500 })
  }
}
