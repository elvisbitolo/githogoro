import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const meetings = await prisma.meetingMinutes.findMany({
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { meetingDate: "desc" },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error("GET /api/governance/meetings error:", error)
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, content, meetingDate, attendees } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const meeting = await prisma.meetingMinutes.create({
      data: {
        userId: user.id,
        title,
        content,
        meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
        attendees: attendees || null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    console.error("POST /api/governance/meetings error:", error)
    return NextResponse.json({ error: "Failed to create meeting minutes" }, { status: 500 })
  }
}
