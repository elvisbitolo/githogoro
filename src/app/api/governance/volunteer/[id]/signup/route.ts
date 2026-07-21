import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const opportunity = await prisma.volunteerOpportunity.findUnique({
      where: { id },
      include: { _count: { select: { signups: true } } },
    })

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    if (opportunity.maxVolunteers && opportunity._count.signups >= opportunity.maxVolunteers) {
      return NextResponse.json({ error: "This opportunity is full" }, { status: 400 })
    }

    const existing = await prisma.volunteerSignup.findUnique({
      where: { opportunityId_userId: { opportunityId: id, userId: user.id } },
    })

    if (existing) {
      return NextResponse.json({ error: "Already signed up" }, { status: 400 })
    }

    const signup = await prisma.volunteerSignup.create({
      data: {
        opportunityId: id,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(signup, { status: 201 })
  } catch (error) {
    console.error("POST /api/governance/volunteer/[id]/signup error:", error)
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 })
  }
}
