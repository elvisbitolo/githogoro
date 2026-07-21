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

    const body = await request.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json({ error: "emoji is required" }, { status: 400 })
    }

    // Check if reaction already exists
    const existing = await prisma.messageReaction.findFirst({
      where: {
        userId: user.id,
        privateMessageId: id,
      },
    })

    if (existing) {
      if (existing.emoji === emoji) {
        // Remove reaction
        await prisma.messageReaction.delete({ where: { id: existing.id } })
        return NextResponse.json({ removed: true })
      } else {
        // Update reaction
        await prisma.messageReaction.update({
          where: { id: existing.id },
          data: { emoji },
        })
        return NextResponse.json({ updated: true })
      }
    }

    // Create new reaction
    await prisma.messageReaction.create({
      data: {
        userId: user.id,
        privateMessageId: id,
        emoji,
      },
    })

    return NextResponse.json({ created: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/messages/[id]/reactions error:", error)
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 })
  }
}
