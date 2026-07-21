import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const checkins = await prisma.mentalHealthCheckIn.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    const anonymized = checkins.map((c) => {
      if (c.isAnonymous) {
        return { ...c, user: { id: "anonymous", name: "Anonymous", avatarUrl: null } }
      }
      return c
    })

    return NextResponse.json(anonymized)
  } catch (error) {
    console.error("GET /api/health/mood error:", error)
    return NextResponse.json({ error: "Failed to fetch mood check-ins" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { mood, note, isAnonymous } = body

    if (mood === undefined || mood < 1 || mood > 5) {
      return NextResponse.json({ error: "Mood must be between 1 and 5" }, { status: 400 })
    }

    const checkin = await prisma.mentalHealthCheckIn.create({
      data: {
        userId: user.id,
        mood,
        note: note || null,
        isAnonymous: isAnonymous || false,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(checkin, { status: 201 })
  } catch (error) {
    console.error("POST /api/health/mood error:", error)
    return NextResponse.json({ error: "Failed to create mood check-in" }, { status: 500 })
  }
}
