import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const where: Record<string, unknown> = {}
    if (status && status !== "all") {
      where.status = status
    }
    if (category && category !== "all") {
      where.category = category
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const result = complaints.map((c) => {
      if (c.isAnonymous) {
        return {
          ...c,
          user: { id: "anonymous", name: "Anonymous", avatarUrl: null },
        }
      }
      return c
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/governance/complaints error:", error)
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, category, isAnonymous } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        title,
        description,
        category: category || null,
        isAnonymous: isAnonymous || false,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error("POST /api/governance/complaints error:", error)
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 })
  }
}
