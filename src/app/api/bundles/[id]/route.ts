import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        votes: {
          select: { userId: true, type: true },
        },
      },
    })

    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    return NextResponse.json(bundle)
  } catch (error) {
    console.error("GET /api/bundles/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch bundle" }, { status: 500 })
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

    const existing = await prisma.bundle.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }
    if (existing.createdBy !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, provider, price, dataAmount, validity, category, url, description } = body

    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(provider && { provider }),
        ...(price && { price: parseFloat(price) }),
        ...(dataAmount && { dataAmount }),
        ...(validity && { validity }),
        ...(category && { category }),
        url: url !== undefined ? url : undefined,
        description: description !== undefined ? description : undefined,
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(bundle)
  } catch (error) {
    console.error("PUT /api/bundles/[id] error:", error)
    return NextResponse.json({ error: "Failed to update bundle" }, { status: 500 })
  }
}

export async function DELETE(
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

    const existing = await prisma.bundle.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }
    if (existing.createdBy !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.bundle.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/bundles/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete bundle" }, { status: 500 })
  }
}
