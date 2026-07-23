import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")
    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 })
    }

    const polls = await prisma.chatPoll.findMany({
      where: { roomId },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        votes: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(polls)
  } catch (error) {
    console.error("GET /api/chat/polls error:", error)
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { roomId, question, options, endsAt } = await request.json()
    if (!roomId || !question || !options?.length) {
      return NextResponse.json({ error: "roomId, question, and options are required" }, { status: 400 })
    }

    const poll = await prisma.chatPoll.create({
      data: {
        roomId,
        question,
        options,
        createdBy: user.id,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        votes: true,
      },
    })

    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    console.error("POST /api/chat/polls error:", error)
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
  }
}
