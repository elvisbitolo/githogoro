import { prisma } from "@/lib/prisma"

export async function getUserProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, isBanned: true },
  })
}

export function isStaffRole(role: string | null | undefined) {
  return role === "admin" || role === "moderator"
}
