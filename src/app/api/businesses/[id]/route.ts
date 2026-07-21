import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const avgRating =
      business.reviews.length > 0
        ? business.reviews.reduce((sum, r) => sum + r.rating, 0) /
          business.reviews.length
        : 0

    return NextResponse.json({
      ...business,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: business.reviews.length,
    })
  } catch (error) {
    console.error("GET /api/businesses/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch business" }, { status: 500 })
  }
}

export async function PUT(
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

    const existing = await prisma.business.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, category, description, phone, locationLat, locationLng, openingHours, photos } = body

    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(phone && { phone }),
        ...(locationLat !== undefined && { locationLat: parseFloat(locationLat) }),
        ...(locationLng !== undefined && { locationLng: parseFloat(locationLng) }),
        ...(openingHours !== undefined && { openingHours }),
        ...(photos !== undefined && { photos }),
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    })

    const avgRating =
      updated.reviews.length > 0
        ? updated.reviews.reduce((sum, r) => sum + r.rating, 0) /
          updated.reviews.length
        : 0

    return NextResponse.json({
      ...updated,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: updated.reviews.length,
      reviews: undefined,
    })
  } catch (error) {
    console.error("PUT /api/businesses/[id] error:", error)
    return NextResponse.json({ error: "Failed to update business" }, { status: 500 })
  }
}

export async function DELETE(
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

    const existing = await prisma.business.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.business.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/businesses/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete business" }, { status: 500 })
  }
}
