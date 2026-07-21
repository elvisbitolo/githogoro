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
    const group = await prisma.tontineGroup.findUnique({
      where: { id },
      include: { members: true },
    })

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    if (group.status !== "active") {
      return NextResponse.json(
        { error: "Group is not active" },
        { status: 400 }
      )
    }

    if (group.members.length >= group.maxMembers) {
      return NextResponse.json(
        { error: "Group is full" },
        { status: 400 }
      )
    }

    const existingMember = group.members.find((m) => m.userId === user.id)
    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 409 }
      )
    }

    const nextPosition =
      Math.max(...group.members.map((m) => m.position), 0) + 1

    const member = await prisma.tontineMember.create({
      data: {
        groupId: id,
        userId: user.id,
        position: nextPosition,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("POST /api/tontine/[id]/join error:", error)
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    )
  }
}
