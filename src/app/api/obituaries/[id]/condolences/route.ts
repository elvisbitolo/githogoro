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

    const { id: obituaryId } = await params
    const body = await request.json()
    const { message, amount } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const obituary = await prisma.obituary.findUnique({ where: { id: obituaryId } })
    if (!obituary) {
      return NextResponse.json({ error: "Obituary not found" }, { status: 404 })
    }

    const condolence = await prisma.condolence.create({
      data: {
        obituaryId,
        userId: user.id,
        message: message.trim(),
        amount: amount ? Number(amount) : null,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    if (amount && Number(amount) > 0) {
      await prisma.obituary.update({
        where: { id: obituaryId },
        data: { fundRaised: { increment: Number(amount) } },
      })
    }

    return NextResponse.json(condolence, { status: 201 })
  } catch (error) {
    console.error("POST /api/obituaries/[id]/condolences error:", error)
    return NextResponse.json({ error: "Failed to post condolence" }, { status: 500 })
  }
}
