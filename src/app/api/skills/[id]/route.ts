import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, phone: true },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    return NextResponse.json(skill)
  } catch (error) {
    console.error("GET /api/skills/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch skill" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const skill = await prisma.skill.findUnique({ where: { id } })

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    if (skill.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        title: body.title ?? skill.title,
        description: body.description ?? skill.description,
        category: body.category ?? skill.category,
        priceRange: body.priceRange ?? skill.priceRange,
        availability: body.availability ?? skill.availability,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/skills/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const skill = await prisma.skill.findUnique({ where: { id } })

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    if (skill.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.skillReview.deleteMany({ where: { skillId: id } })
    await prisma.skill.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/skills/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    )
  }
}
