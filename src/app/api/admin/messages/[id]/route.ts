import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyModerator } from "@/lib/admin-guard"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyModerator()
  if ("error" in auth) return auth.error

  const { id } = await params

  const message = await prisma.message.findUnique({
    where: { id },
    select: { id: true, text: true, userId: true, roomId: true },
  })
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.messageReaction.deleteMany({ where: { messageId: id } }),
    prisma.message.delete({ where: { id } }),
  ])

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: "delete_message",
      targetId: id,
      details: {
        content: message.text?.slice(0, 100),
        authorId: message.userId,
        roomId: message.roomId,
      },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json({ success: true })
}
