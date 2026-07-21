import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } })
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    const comment = await prisma.complaintComment.create({
      data: {
        complaintId: id,
        userId: user.id,
        text,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("POST /api/governance/complaints/[id]/comments error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
