import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

const VALID_TARGET_TYPES = ["user", "post", "message", "marketplace", "business", "comment"]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { targetType, targetId, reason, details } = body

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: "targetType, targetId, and reason are required" },
        { status: 400 }
      )
    }

    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 })
    }

    if (typeof reason !== "string" || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Please describe the issue in at least 5 characters" },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType,
        targetId,
        reason: reason.trim().slice(0, 500),
        details: details?.trim()?.slice(0, 2000) || null,
      },
    })

    return NextResponse.json({ id: report.id }, { status: 201 })
  } catch (error) {
    console.error("POST /api/reports error:", error)
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
  }
}
