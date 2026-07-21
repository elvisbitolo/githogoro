import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(
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

    if (skill.userId === user.id) {
      return NextResponse.json(
        { error: "Cannot review your own skill" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const review = await prisma.skillReview.create({
      data: {
        skillId: id,
        reviewerId: user.id,
        revieweeId: skill.userId,
        rating,
        comment: comment || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    const stats = await prisma.skillReview.aggregate({
      where: { skillId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.skill.update({
      where: { id },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    })

    await prisma.reputationLog.create({
      data: {
        userId: user.id,
        action: "review_given",
        points: 5,
        description: `Reviewed skill: ${skill.title}`,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("POST /api/skills/[id]/review error:", error)
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this skill" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}
