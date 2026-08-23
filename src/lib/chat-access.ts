import { prisma } from "@/lib/prisma"

export async function isConversationParticipant(
  conversationId: string,
  userId: string
) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  })
  return !!participant
}

export async function isChatRoomMember(roomId: string, userId: string) {
  const member = await prisma.chatParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
    select: { userId: true },
  })
  return !!member
}
