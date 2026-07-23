import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const message = await prisma.privateMessage.findUnique({ where: { id } })
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Verify user is a participant in the conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: message.conversationId, userId: user.id },
    })
    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.privateMessage.update({
      where: { id },
      data: { isStarred: !message.isStarred },
    })

    return NextResponse.json({ isStarred: updated.isStarred })
  } catch (error) {
    console.error("POST /api/messages/[id]/star error:", error)
    return NextResponse.json({ error: "Failed to toggle star" }, { status: 500 })
  }
}
