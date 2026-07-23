import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const pinned = await prisma.pinnedConversation.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(pinned)
  } catch (error) {
    console.error("GET /api/chat/pinned error:", error)
    return NextResponse.json({ error: "Failed to fetch pinned conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { conversationId } = await request.json()
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    const pinned = await prisma.pinnedConversation.upsert({
      where: { conversationId_userId: { conversationId, userId: user.id } },
      update: {},
      create: { conversationId, userId: user.id },
    })

    return NextResponse.json(pinned, { status: 201 })
  } catch (error) {
    console.error("POST /api/chat/pinned error:", error)
    return NextResponse.json({ error: "Failed to pin conversation" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { conversationId } = await request.json()
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    await prisma.pinnedConversation.deleteMany({
      where: { conversationId, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/chat/pinned error:", error)
    return NextResponse.json({ error: "Failed to unpin conversation" }, { status: 500 })
  }
}
