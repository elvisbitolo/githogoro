import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    const groups = await prisma.tontineGroup.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        members: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("GET /api/tontine error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tontine groups" },
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
    const { name, description, contributionAmount, frequency, maxMembers } =
      body

    if (!name || !contributionAmount) {
      return NextResponse.json(
        { error: "Name and contribution amount are required" },
        { status: 400 }
      )
    }

    const group = await prisma.tontineGroup.create({
      data: {
        name,
        description: description || null,
        contributionAmount: parseFloat(contributionAmount),
        frequency: frequency || "weekly",
        maxMembers: maxMembers || 20,
        creatorId: user.id,
        totalCycles: maxMembers || 20,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    await prisma.tontineMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        position: 1,
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error("POST /api/tontine error:", error)
    return NextResponse.json(
      { error: "Failed to create tontine group" },
      { status: 500 }
    )
  }
}
