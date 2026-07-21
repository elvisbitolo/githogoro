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
    const member = await prisma.savingsChallengeMember.findUnique({
      where: { challengeId_userId: { challengeId: id, userId: user.id } },
    })

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this challenge" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    const updated = await prisma.savingsChallengeMember.update({
      where: { challengeId_userId: { challengeId: id, userId: user.id } },
      data: {
        savedAmount: member.savedAmount + parseFloat(amount),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("POST /api/savings/[id]/contribute error:", error)
    return NextResponse.json(
      { error: "Failed to add savings" },
      { status: 500 }
    )
  }
}
