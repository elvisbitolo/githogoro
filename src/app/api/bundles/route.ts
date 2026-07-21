import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (provider && provider !== "all") {
      where.provider = provider
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const bundles = await prisma.bundle.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [
        { upvotes: "desc" },
        { downvotes: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(bundles)
  } catch (error) {
    console.error("GET /api/bundles error:", error)
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 })
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
    const { name, provider, price, dataAmount, validity, category, url, description } = body

    if (!name || !provider || !price || !dataAmount || !validity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const bundle = await prisma.bundle.create({
      data: {
        name,
        provider,
        price: parseFloat(price),
        dataAmount,
        validity,
        category: category || "other",
        url: url || null,
        description: description || null,
        createdBy: user.id,
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error("POST /api/bundles error:", error)
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 })
  }
}
