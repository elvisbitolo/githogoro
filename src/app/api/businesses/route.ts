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
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    const businesses = await prisma.business.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    })

    const result = businesses.map((biz) => {
      const avgRating =
        biz.reviews.length > 0
          ? biz.reviews.reduce((sum, r) => sum + r.rating, 0) / biz.reviews.length
          : 0
      return {
        ...biz,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: biz.reviews.length,
        reviews: undefined,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/businesses error:", error)
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, description, phone, locationLat, locationLng, openingHours, photos } = body

    if (!name || !category || !phone) {
      return NextResponse.json(
        { error: "Name, category, and phone are required" },
        { status: 400 }
      )
    }

    const business = await prisma.business.create({
      data: {
        name,
        category,
        description: description || null,
        phone,
        locationLat: locationLat ? parseFloat(locationLat) : null,
        locationLng: locationLng ? parseFloat(locationLng) : null,
        openingHours: openingHours || null,
        photos: photos || [],
        createdBy: user.id,
        ownerId: user.id,
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

    return NextResponse.json(
      {
        ...business,
        avgRating: 0,
        reviewCount: 0,
        reviews: undefined,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/businesses error:", error)
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 })
  }
}
