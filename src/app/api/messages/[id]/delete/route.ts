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

    if (message.senderId !== user.id) {
      return NextResponse.json({ error: "Can only delete your own messages" }, { status: 403 })
    }

    await prisma.privateMessage.update({
      where: { id },
      data: { isDeleted: true, text: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/messages/[id]/delete error:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}
