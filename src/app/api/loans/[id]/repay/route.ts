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
    const loan = await prisma.microLoan.findUnique({ where: { id } })

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    if (loan.lenderId !== user.id) {
      return NextResponse.json(
        { error: "Only the lender can mark as repaid" },
        { status: 403 }
      )
    }

    if (loan.status !== "active") {
      return NextResponse.json(
        { error: "Loan is not active" },
        { status: 400 }
      )
    }

    const updated = await prisma.microLoan.update({
      where: { id },
      data: {
        status: "repaid",
        repaidAt: new Date(),
      },
      include: {
        lender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        borrower: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    await prisma.notification.create({
      data: {
        userId: loan.borrowerId,
        type: "loan_repayment",
        title: "Loan Repaid",
        body: `Your loan of Ksh ${loan.amount.toLocaleString()} has been marked as repaid`,
        fromUserId: user.id,
        entityId: id,
        entityType: "loan",
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("POST /api/loans/[id]/repay error:", error)
    return NextResponse.json(
      { error: "Failed to mark as repaid" },
      { status: 500 }
    )
  }
}
