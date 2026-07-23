import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [users, jobs, businesses] = await Promise.all([
      prisma.profile.count(),
      prisma.job.count(),
      prisma.business.count(),
    ])

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeUsers = await prisma.profile.count({
      where: { lastSeen: { gte: weekAgo } },
    })

    return NextResponse.json({
      residents: users,
      jobs,
      businesses,
      activeUsers,
    })
  } catch {
    return NextResponse.json({ residents: 0, jobs: 0, businesses: 0, activeUsers: 0 })
  }
}
