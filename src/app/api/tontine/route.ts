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

    const amount = parseFloat(contributionAmount)
    const max = parseInt(maxMembers, 10)

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Contribution amount must be a positive number" },
        { status: 400 }
      )
    }

    const memberLimit = !isNaN(max) && max > 0 ? max : 20

    const group = await prisma.tontineGroup.create({
      data: {
        name,
        description: description || null,
        contributionAmount: amount,
        frequency: frequency || "weekly",
        maxMembers: memberLimit,
        creatorId: user.id,
        totalCycles: memberLimit,
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
