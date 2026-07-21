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

    const { id } = await params

    const errand = await prisma.errand.findUnique({ where: { id } })
    if (!errand) return NextResponse.json({ error: "Errand not found" }, { status: 404 })
    if (errand.status !== "open") return NextResponse.json({ error: "Errand is no longer available" }, { status: 400 })
    if (errand.creatorId === user.id) return NextResponse.json({ error: "Cannot accept your own errand" }, { status: 400 })

    const updated = await prisma.errand.update({
      where: { id },
      data: { accepterId: user.id, status: "accepted" },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true, zone: true } },
        accepter: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("POST /api/errands/[id]/accept error:", error)
    return NextResponse.json({ error: "Failed to accept errand" }, { status: 500 })
  }
}
