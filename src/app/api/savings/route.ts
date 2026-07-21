import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const challenges = await prisma.savingsChallenge.findMany({
      include: {
        members: {
          select: { id: true, userId: true, savedAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(challenges)
  } catch (error) {
    console.error("GET /api/savings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch savings challenges" },
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
    const { title, description, targetAmount, duration, startDate, endDate } =
      body

    if (!title || !targetAmount || !duration) {
      return NextResponse.json(
        { error: "Title, target amount, and duration are required" },
        { status: 400 }
      )
    }

    const challenge = await prisma.savingsChallenge.create({
      data: {
        title,
        description: description || null,
        targetAmount: parseFloat(targetAmount),
        duration,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: {
        members: true,
      },
    })

    await prisma.savingsChallengeMember.create({
      data: {
        challengeId: challenge.id,
        userId: user.id,
      },
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    console.error("POST /api/savings error:", error)
    return NextResponse.json(
      { error: "Failed to create savings challenge" },
      { status: 500 }
    )
  }
}
