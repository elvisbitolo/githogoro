import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const skills = await prisma.skill.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, phone: true, zone: true, isVerified: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error("GET /api/skills error:", error)
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, priceRange, availability } = body

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      )
    }

    const skill = await prisma.skill.create({
      data: {
        title,
        description: description || null,
        category,
        priceRange: priceRange || null,
        availability: availability || "available",
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    await prisma.reputationLog.create({
      data: {
        userId: user.id,
        action: "skill_posted",
        points: 10,
        description: `Posted skill: ${title}`,
      },
    })

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    console.error("POST /api/skills error:", error)
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    )
  }
}
