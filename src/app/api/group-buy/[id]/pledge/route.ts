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
    const purchase = await prisma.groupPurchase.findUnique({ where: { id } })

    if (!purchase) {
      return NextResponse.json(
        { error: "Group buy not found" },
        { status: 404 }
      )
    }

    if (!purchase.isActive) {
      return NextResponse.json(
        { error: "Group buy is no longer active" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { amount, quantity } = body

    if (!amount || amount < purchase.minPledge) {
      return NextResponse.json(
        { error: `Minimum pledge is Ksh ${purchase.minPledge}` },
        { status: 400 }
      )
    }

    const pledge = await prisma.groupPurchasePledge.upsert({
      where: {
        groupPurchaseId_userId: {
          groupPurchaseId: id,
          userId: user.id,
        },
      },
      update: {
        amount: parseFloat(amount),
        quantity: quantity || 1,
      },
      create: {
        groupPurchaseId: id,
        userId: user.id,
        amount: parseFloat(amount),
        quantity: quantity || 1,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    const totalPledges = await prisma.groupPurchasePledge.aggregate({
      where: { groupPurchaseId: id },
      _sum: { amount: true },
    })

    await prisma.groupPurchase.update({
      where: { id },
      data: {
        currentPledge: totalPledges._sum.amount || 0,
      },
    })

    return NextResponse.json(pledge, { status: 201 })
  } catch (error) {
    console.error("POST /api/group-buy/[id]/pledge error:", error)
    return NextResponse.json(
      { error: "Failed to pledge" },
      { status: 500 }
    )
  }
}
