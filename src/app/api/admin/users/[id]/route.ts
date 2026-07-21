import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { Prisma } from "@prisma/client"

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
  const { role, isVerified } = body

  const data: Record<string, unknown> = {}
  if (role !== undefined) data.role = role
  if (isVerified !== undefined) data.isVerified = isVerified

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const updated = await prisma.profile.update({
    where: { id },
    data,
    select: { id: true, name: true, role: true, isVerified: true },
  })

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: role !== undefined ? "change_role" : "toggle_verify",
      targetId: id,
      details: data as Prisma.InputJsonValue,
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request)
  if ("error" in auth) return auth.error

  const { id } = await params

  const target = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { userId: id } }),
    prisma.alertRead.deleteMany({ where: { userId: id } }),
    prisma.messageReaction.deleteMany({ where: { userId: id } }),
    prisma.messageReadReceipt.deleteMany({ where: { userId: id } }),
    prisma.chatParticipant.deleteMany({ where: { userId: id } }),
    prisma.bundleVote.deleteMany({ where: { userId: id } }),
    prisma.reputationLog.deleteMany({ where: { userId: id } }),
    prisma.profile.delete({ where: { id } }),
  ])

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: "delete_user",
      targetId: id,
      details: { name: target.name },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json({ success: true })
}
