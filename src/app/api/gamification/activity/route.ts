import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

const ACTIVITY_POINTS: Record<string, number> = {
  post_created: 10,
  comment_added: 5,
  event_attended: 15,
  skill_shared: 20,
  harambee_donated: 25,
  errand_completed: 10,
  alert_posted: 5,
  referral: 50,
  daily_login: 5,
}

const ACTION_MAP: Record<string, string> = {
  post_created: "post_created",
  comment_added: "comment_added",
  event_attended: "event_organized",
  skill_shared: "skill_posted",
  harambee_donated: "harambee_donated",
  errand_completed: "message_sent",
  alert_posted: "place_reported",
  referral: "bundle_shared",
  daily_login: "poll_voted",
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { type, points: customPoints } = body

    if (!type || !ACTIVITY_POINTS[type]) {
      return NextResponse.json(
        { error: `Invalid activity type. Valid types: ${Object.keys(ACTIVITY_POINTS).join(", ")}` },
        { status: 400 }
      )
    }

    const points = customPoints ?? ACTIVITY_POINTS[type]
    const action = ACTION_MAP[type] || "post_created"

    const log = await prisma.reputationLog.create({
      data: {
        userId: user.id,
        action: action as any,
        points,
        description: type,
      },
    })

    await prisma.profile.update({
      where: { id: user.id },
      data: { reputationPoints: { increment: points } },
    })

    return NextResponse.json(
      { id: log.id, type, points, createdAt: log.createdAt },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/gamification/activity error:", error)
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
}
