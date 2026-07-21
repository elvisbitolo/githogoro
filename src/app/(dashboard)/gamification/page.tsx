"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Flame,
  Trophy,
  Star,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Medal,
  Crown,
  Shield,
  Heart,
} from "lucide-react"

interface ZoneEntry {
  zone: string
  totalPoints: number
  memberCount: number
}

interface ActivityEntry {
  type: string
  points: number
  createdAt: string
}

interface GamificationData {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  nextLevelPoints: number
  zoneRank: number | null
  zoneLeaderboard: ZoneEntry[]
  recentActivity: ActivityEntry[]
}

const ACHIEVEMENTS = [
  { id: "first_post", name: "First Post", icon: Star, description: "Created your first post", threshold: 10 },
  { id: "7day_streak", name: "7-Day Streak", icon: Flame, description: "7 consecutive days active", threshold: 7 },
  { id: "30day_streak", name: "30-Day Streak", icon: Flame, description: "30 consecutive days active", threshold: 30 },
  { id: "top_contributor", name: "Top Contributor", icon: Trophy, description: "Reached 500 points", threshold: 500 },
  { id: "zone_hero", name: "Zone Hero", icon: Medal, description: "Top 3 in your zone", threshold: 0 },
  { id: "community_helper", name: "Community Helper", icon: Heart, description: "Reached level 5", threshold: 5 },
  { id: "harambee_champion", name: "Harambee Champion", icon: Award, description: "Reached level 10", threshold: 10 },
  { id: "market_maven", name: "Market Maven", icon: Crown, description: "Reached level 20", threshold: 20 },
]

const ACTIVITY_LABELS: Record<string, string> = {
  post_created: "Created a post",
  comment_added: "Added a comment",
  event_organized: "Attended an event",
  skill_posted: "Shared a skill",
  harambee_donated: "Harambee donation",
  message_sent: "Completed errand",
  place_reported: "Posted alert",
  bundle_shared: "Made a referral",
  poll_voted: "Daily login",
}

export default function GamificationPage() {
  const [data, setData] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/gamification")
      .then((res) => res.json())
      .then((d) => {
        if (d.totalPoints !== undefined) setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })

  const activeDays = new Set(
    (data?.recentActivity || []).map((a) =>
      new Date(a.createdAt).toISOString().slice(0, 10)
    )
  )

  const progressPercent = data
    ? ((data.totalPoints % 100) / 100) * 100
    : 0

  function getUnlocked(ach: (typeof ACHIEVEMENTS)[0]): boolean {
    if (!data) return false
    if (ach.id === "zone_hero") return (data.zoneRank || 999) <= 3
    if (ach.id === "7day_streak") return data.longestStreak >= 7
    if (ach.id === "30day_streak") return data.longestStreak >= 30
    if (ach.id === "community_helper") return data.level >= 5
    if (ach.id === "harambee_champion") return data.level >= 10
    if (ach.id === "market_maven") return data.level >= 20
    if (ach.id === "top_contributor") return data.totalPoints >= 500
    if (ach.id === "first_post") return data.totalPoints >= 10
    return false
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-100 rounded-2xl h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No gamification data yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Start participating to earn points!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold mb-1">Your Progress</h1>
        <p className="text-zinc-500 text-sm">Level up by contributing to the community</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs font-medium opacity-80">Level</span>
            </div>
            <p className="text-3xl font-bold">{data.level}</p>
            <div className="mt-2 w-full bg-emerald-600/50 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] mt-1 opacity-70">
              {data.totalPoints % 100} / 100 to next level
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium opacity-80">Streak</span>
            </div>
            <p className="text-3xl font-bold">{data.currentStreak}</p>
            <p className="text-[10px] opacity-70">days consecutive</p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4" />
              <span className="text-xs font-medium opacity-80">Points</span>
            </div>
            <p className="text-3xl font-bold">{data.totalPoints.toLocaleString()}</p>
            <p className="text-[10px] opacity-70">total earned</p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Medal className="h-4 w-4" />
              <span className="text-xs font-medium opacity-80">Zone Rank</span>
            </div>
            <p className="text-3xl font-bold">#{data.zoneRank || "—"}</p>
            <p className="text-[10px] opacity-70">best streak {data.longestStreak}d</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-700">Activity Calendar</h2>
            <span className="text-[10px] text-zinc-400 ml-auto">Last 30 days</span>
          </div>
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1">
            {calendarDays.map((day) => (
              <div
                key={day}
                className={`aspect-square rounded-md ${
                  activeDays.has(day)
                    ? "bg-emerald-500"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
                title={day}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-700">Zone Leaderboard</h2>
          </div>
          {data.zoneLeaderboard.length === 0 ? (
            <p className="text-zinc-400 text-sm">No zones with activity yet</p>
          ) : (
            <div className="space-y-2">
              {data.zoneLeaderboard.slice(0, 10).map((z, i) => (
                <div
                  key={z.zone}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? "bg-amber-100 text-amber-700"
                        : i === 1
                          ? "bg-zinc-200 text-zinc-600"
                          : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 truncate">
                      {z.zone}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {z.memberCount} member{z.memberCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    {z.totalPoints.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-purple-500" />
            <h2 className="text-sm font-semibold text-zinc-700">Achievements</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = getUnlocked(ach)
              const Icon = ach.icon
              return (
                <div
                  key={ach.id}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-colors ${
                    unlocked
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-zinc-100 bg-zinc-50 opacity-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      unlocked
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-zinc-200 text-zinc-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-700">{ach.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{ach.description}</p>
                  {unlocked && (
                    <span className="mt-1 text-[9px] font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      Unlocked
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-zinc-700">Recent Activity</h2>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="text-zinc-400 text-sm">No activity yet</p>
          ) : (
            <div className="space-y-1.5">
              {data.recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 truncate">
                      {ACTIVITY_LABELS[a.type] || a.type}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0">
                    +{a.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
