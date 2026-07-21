import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const loan = await prisma.microLoan.findUnique({
      where: { id },
      include: {
        lender: {
          select: { id: true, name: true, avatarUrl: true, phone: true },
        },
        borrower: {
          select: { id: true, name: true, avatarUrl: true, phone: true },
        },
      },
    })

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error("GET /api/loans/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch loan" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
        { error: "Only the lender can update this loan" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updated = await prisma.microLoan.update({
      where: { id },
      data: {
        status: body.status ?? loan.status,
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

    if (body.status === "active") {
      await prisma.notification.create({
        data: {
          userId: loan.borrowerId,
          type: "loan_request",
          title: "Loan Approved",
          body: `Your loan request of Ksh ${loan.amount.toLocaleString()} has been approved`,
          fromUserId: user.id,
          entityId: id,
          entityType: "loan",
        },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/loans/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update loan" },
      { status: 500 }
    )
  }
}
