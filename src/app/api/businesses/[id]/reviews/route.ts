import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reviews = await prisma.businessReview.findMany({
      where: { businessId: id },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("GET /api/businesses/[id]/reviews error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({ where: { id } })
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const existing = await prisma.businessReview.findUnique({
      where: { businessId_userId: { businessId: id, userId: user.id } },
    })

    if (existing) {
      const updated = await prisma.businessReview.update({
        where: { id: existing.id },
        data: { rating: parseInt(rating), comment: comment || null },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      })
      return NextResponse.json(updated)
    }

    const review = await prisma.businessReview.create({
      data: {
        businessId: id,
        userId: user.id,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("POST /api/businesses/[id]/reviews error:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
