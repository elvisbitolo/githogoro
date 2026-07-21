import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const purchases = await prisma.groupPurchase.findMany({
      where: { isActive: true },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        pledges: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error("GET /api/group-buy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch group buys" },
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
    const { title, description, product, targetPledge, minPledge, deadline } =
      body

    if (!title || !product || !targetPledge || !minPledge) {
      return NextResponse.json(
        { error: "Title, product, target pledge, and min pledge are required" },
        { status: 400 }
      )
    }

    const purchase = await prisma.groupPurchase.create({
      data: {
        title,
        description: description || null,
        product,
        targetPledge: parseFloat(targetPledge),
        minPledge: parseFloat(minPledge),
        deadline: deadline ? new Date(deadline) : null,
        creatorId: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error("POST /api/group-buy error:", error)
    return NextResponse.json(
      { error: "Failed to create group buy" },
      { status: 500 }
    )
  }
}
