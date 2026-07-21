import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const product = searchParams.get("product")

    const where: Record<string, unknown> = {}

    if (product) {
      where.product = { contains: product, mode: "insensitive" }
    }

    const reports = await prisma.priceReport.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("GET /api/prices error:", error)
    return NextResponse.json(
      { error: "Failed to fetch price reports" },
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
    const { product, shop, price, zone } = body

    if (!product || !shop || price == null) {
      return NextResponse.json(
        { error: "Product, shop, and price are required" },
        { status: 400 }
      )
    }

    const report = await prisma.priceReport.create({
      data: {
        product,
        shop,
        price: parseFloat(price),
        zone: zone || null,
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("POST /api/prices error:", error)
    return NextResponse.json(
      { error: "Failed to report price" },
      { status: 500 }
    )
  }
}
