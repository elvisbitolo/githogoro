import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { zone: true, reputationPoints: true },
    })

    const logs = await prisma.reputationLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    const totalPoints = logs.reduce((sum, l) => sum + l.points, 0)
    const level = Math.floor(totalPoints / 100) + 1
    const nextLevelPoints = level * 100

    const daysWithActivity = new Set(
      logs.map((l) => l.createdAt.toISOString().slice(0, 10))
    )

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (daysWithActivity.has(key)) {
        tempStreak++
        if (i === currentStreak) currentStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
        if (i === currentStreak) break
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

    const zoneAgg = await prisma.reputationLog.groupBy({
      by: ["userId"],
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
    })

    const zoneMemberMap = new Map<
      string,
      { totalPoints: number; memberCount: number }
    >()

    for (const entry of zoneAgg) {
      const p = await prisma.profile.findUnique({
        where: { id: entry.userId },
        select: { zone: true },
      })
      const zone = p?.zone || "Unassigned"
      const existing = zoneMemberMap.get(zone) || {
        totalPoints: 0,
        memberCount: 0,
      }
      existing.totalPoints += entry._sum.points || 0
      existing.memberCount += 1
      zoneMemberMap.set(zone, existing)
    }

    const zoneLeaderboard = Array.from(zoneMemberMap.entries())
      .map(([zone, data]) => ({ zone, ...data }))
      .sort((a, b) => b.totalPoints - a.totalPoints)

    const userZone = profile?.zone || "Unassigned"
    const zoneRank = zoneLeaderboard.findIndex((z) => z.zone === userZone) + 1

    const recentActivity = logs.slice(0, 20).map((l) => ({
      type: l.action,
      points: l.points,
      createdAt: l.createdAt,
    }))

    return NextResponse.json({
      totalPoints,
      currentStreak,
      longestStreak,
      level,
      nextLevelPoints,
      zoneRank: zoneRank || null,
      zoneLeaderboard,
      recentActivity,
    })
  } catch (error) {
    console.error("GET /api/gamification error:", error)
    return NextResponse.json(
      { error: "Failed to fetch gamification data" },
      { status: 500 }
    )
  }
}
