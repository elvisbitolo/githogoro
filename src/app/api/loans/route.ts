import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter")

    const whereGiven = filter === "taken" ? false : { lenderId: user.id }
    const whereTaken = filter === "given" ? false : { borrowerId: user.id }

    const [given, taken] = await Promise.all([
      filter !== "taken"
        ? prisma.microLoan.findMany({
            where: whereGiven as Record<string, unknown>,
            include: {
              borrower: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : [],
      filter !== "given"
        ? prisma.microLoan.findMany({
            where: whereTaken as Record<string, unknown>,
            include: {
              lender: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : [],
    ])

    return NextResponse.json({ given, taken })
  } catch (error) {
    console.error("GET /api/loans error:", error)
    return NextResponse.json(
      { error: "Failed to fetch loans" },
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
    const { lenderId, amount, interestRate, description, dueDate } = body

    if (!lenderId || !amount) {
      return NextResponse.json(
        { error: "Lender and amount are required" },
        { status: 400 }
      )
    }

    if (lenderId === user.id) {
      return NextResponse.json(
        { error: "Cannot loan from yourself" },
        { status: 400 }
      )
    }

    const loan = await prisma.microLoan.create({
      data: {
        lenderId,
        borrowerId: user.id,
        amount: parseFloat(amount),
        interestRate: interestRate ? parseFloat(interestRate) : null,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
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
        userId: lenderId,
        type: "loan_request",
        title: "Loan Request",
        body: `${user.email || "Someone"} is requesting a loan of Ksh ${parseFloat(amount).toLocaleString()}`,
        fromUserId: user.id,
        entityId: loan.id,
        entityType: "loan",
      },
    })

    return NextResponse.json(loan, { status: 201 })
  } catch (error) {
    console.error("POST /api/loans error:", error)
    return NextResponse.json(
      { error: "Failed to create loan request" },
      { status: 500 }
    )
  }
}
