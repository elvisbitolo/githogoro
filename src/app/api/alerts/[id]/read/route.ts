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

    const alert = await prisma.alert.findUnique({ where: { id } })
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    const existing = await prisma.alertRead.findUnique({
      where: { alertId_userId: { alertId: id, userId: user.id } },
    })

    if (!existing) {
      await prisma.alertRead.create({
        data: {
          alertId: id,
          userId: user.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/alerts/[id]/read error:", error)
    return NextResponse.json({ error: "Failed to mark alert as read" }, { status: 500 })
  }
}
