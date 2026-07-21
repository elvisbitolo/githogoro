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
    const campaign = await prisma.harambee.findUnique({ where: { id } })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    if (campaign.status !== "active") {
      return NextResponse.json(
        { error: "Campaign is no longer active" },
        { status: 400 }
      )
    }

    if (campaign.creatorId === user.id) {
      return NextResponse.json(
        { error: "Cannot donate to your own campaign" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { amount, message, isAnonymous } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Donation amount must be greater than 0" },
        { status: 400 }
      )
    }

    const donation = await prisma.harambeeDonation.create({
      data: {
        harambeeId: id,
        donorId: user.id,
        amount: parseFloat(amount),
        message: message || null,
        isAnonymous: isAnonymous || false,
      },
      include: {
        donor: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    const newRaised = campaign.raisedAmount + parseFloat(amount)
    const newStatus =
      newRaised >= campaign.goalAmount ? "funded" : campaign.status

    await prisma.harambee.update({
      where: { id },
      data: {
        raisedAmount: newRaised,
        status: newStatus,
      },
    })

    await prisma.notification.create({
      data: {
        userId: campaign.creatorId,
        type: "harambee_donation",
        title: "New Donation",
        body: isAnonymous
          ? `Someone donated Ksh ${parseFloat(amount).toLocaleString()} to "${campaign.title}"`
          : `${user.email || "Someone"} donated Ksh ${parseFloat(amount).toLocaleString()} to "${campaign.title}"`,
        fromUserId: user.id,
        entityId: id,
        entityType: "harambee",
      },
    })

    await prisma.reputationLog.create({
      data: {
        userId: user.id,
        action: "harambee_donated",
        points: 10,
        description: `Donated to ${campaign.title}`,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error("POST /api/harambee/[id]/donate error:", error)
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    )
  }
}
