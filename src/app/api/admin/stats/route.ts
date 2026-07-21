import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const [
      users,
      jobs,
      messages,
      businesses,
      alerts,
      events,
      bundles,
      places,
      videos,
      recentUsers,
      recentMessages,
      recentJobs,
      recentBusinesses,
      prevWeekUsers,
      prevWeekMessages,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.job.count(),
      prisma.message.count(),
      prisma.business.count(),
      prisma.alert.count(),
      prisma.event.count(),
      prisma.bundle.count(),
      prisma.communityPlace.count(),
      prisma.video.count(),
      prisma.profile.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.message.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.job.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.business.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.profile.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.message.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    ])

    const recentRegistrations = await prisma.profile.findMany({
      where: { createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { name: true, phone: true, createdAt: true },
    })

    const activeUsersRaw = await prisma.message.groupBy({
      by: ["userId"],
      _count: { id: true },
      where: { createdAt: { gte: weekAgo } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    const userIds = activeUsersRaw.map((u) => u.userId)
    const userProfiles = await prisma.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, zone: true },
    })
    const profileMap = new Map(userProfiles.map((p) => [p.id, p]))

    const mostActiveUsers = activeUsersRaw.map((u) => {
      const profile = profileMap.get(u.userId)
      return {
        name: (profile as any)?.name || "Unknown",
        messageCount: u._count.id,
        zone: (profile as any)?.zone || null,
      }
    })

    const growthPercent = (current: number, previous: number) =>
      previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100

    return NextResponse.json({
      users,
      jobs,
      messages,
      businesses,
      alerts,
      events,
      bundles,
      places,
      videos,
      recentUsers,
      recentMessages,
      recentJobs,
      recentBusinesses,
      userGrowthPercent: growthPercent(recentUsers, prevWeekUsers),
      messageGrowthPercent: growthPercent(recentMessages, prevWeekMessages),
      recentRegistrations,
      mostActiveUsers,
    })
  } catch (error) {
    console.error("GET /api/admin/stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
