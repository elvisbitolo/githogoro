import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { childName, location, status, message } = body

    const checkIn = await prisma.childCheckIn.create({
      data: {
        userId: user.id,
        childName,
        location,
        status: status || "safe",
        message: message || null,
      },
    })
    return NextResponse.json(checkIn, { status: 201 })
  } catch (error) {
    console.error("POST /api/safety/checkin error:", error)
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
  }
}
