import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (category && category !== "all") {
      where.category = category
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const items = await prisma.marketplaceItem.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET /api/marketplace error:", error)
    return NextResponse.json(
      { error: "Failed to fetch marketplace items" },
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
    const { title, description, price, category, photos, location } = body

    if (!title || price == null || !category) {
      return NextResponse.json(
        { error: "Title, price, and category are required" },
        { status: 400 }
      )
    }

    const item = await prisma.marketplaceItem.create({
      data: {
        title,
        description: description || null,
        price: parseFloat(price),
        category,
        photos: photos || [],
        location: location || null,
        sellerId: user.id,
      },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("POST /api/marketplace error:", error)
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    )
  }
}
