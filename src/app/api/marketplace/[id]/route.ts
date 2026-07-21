import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const item = await prisma.marketplaceItem.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true, phone: true },
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("GET /api/marketplace/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.marketplaceItem.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (existing.sellerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, price, category, photos, location, status } =
      body

    const item = await prisma.marketplaceItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(category !== undefined && { category }),
        ...(photos !== undefined && { photos }),
        ...(location !== undefined && { location }),
        ...(status !== undefined && { status }),
      },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("PUT /api/marketplace/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.marketplaceItem.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (existing.sellerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.marketplaceItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/marketplace/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    )
  }
}
