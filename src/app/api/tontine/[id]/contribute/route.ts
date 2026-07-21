import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const group = await prisma.tontineGroup.findUnique({ where: { id } })

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    const member = await prisma.tontineMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    })

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { cycle } = body

    if (cycle == null) {
      return NextResponse.json(
        { error: "Cycle number is required" },
        { status: 400 }
      )
    }

    const contribution = await prisma.tontineContribution.upsert({
      where: {
        groupId_userId_cycle: {
          groupId: id,
          userId: user.id,
          cycle: parseInt(cycle),
        },
      },
      update: {
        isPaid: true,
        paidAt: new Date(),
      },
      create: {
        groupId: id,
        userId: user.id,
        cycle: parseInt(cycle),
        amount: group.contributionAmount,
        isPaid: true,
        paidAt: new Date(),
      },
    })

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    console.error("POST /api/tontine/[id]/contribute error:", error)
    return NextResponse.json(
      { error: "Failed to record contribution" },
      { status: 500 }
    )
  }
}
