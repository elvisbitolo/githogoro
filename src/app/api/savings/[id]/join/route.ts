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
    const challenge = await prisma.savingsChallenge.findUnique({
      where: { id },
    })

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      )
    }

    const member = await prisma.savingsChallengeMember.create({
      data: {
        challengeId: id,
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("POST /api/savings/[id]/join error:", error)
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Already joined this challenge" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to join challenge" },
      { status: 500 }
    )
  }
}
