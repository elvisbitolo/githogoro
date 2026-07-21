import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

async function verifyAdmin(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { userId: user.id }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const { isApproved } = body

  if (isApproved === undefined) {
    return NextResponse.json({ error: "isApproved is required" }, { status: 400 })
  }

  const place = await prisma.communityPlace.findUnique({ where: { id } })
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 })
  }

  const updated = await prisma.communityPlace.update({
    where: { id },
    data: { isApproved },
  })

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: isApproved ? "approve_place" : "reject_place",
      targetId: id,
      details: { name: place.name, category: place.category },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json(updated)
}
