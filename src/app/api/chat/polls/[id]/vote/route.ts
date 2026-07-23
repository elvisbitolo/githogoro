import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: pollId } = await params
    const { option } = await request.json()

    if (option === undefined || typeof option !== "number") {
      return NextResponse.json({ error: "option (number) is required" }, { status: 400 })
    }

    const poll = await prisma.chatPoll.findUnique({ where: { id: pollId } })
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (poll.status === "closed" || (poll.endsAt && new Date() > poll.endsAt)) {
      return NextResponse.json({ error: "Poll is closed" }, { status: 400 })
    }

    const vote = await prisma.chatPollVote.upsert({
      where: { pollId_userId: { pollId, userId: user.id } },
      update: { option },
      create: { pollId, userId: user.id, option },
    })

    return NextResponse.json(vote, { status: 201 })
  } catch (error) {
    console.error("POST /api/chat/polls/[id]/vote error:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}
