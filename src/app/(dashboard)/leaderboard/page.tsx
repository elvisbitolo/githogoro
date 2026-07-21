"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Star, Shield, User } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  avatarUrl: string | null
  zone: string | null
  reputationPoints: number
  reputationScore: number
  createdAt: string
  tier: string
}

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: typeof Trophy }> = {
  Leader: { color: "text-amber-600", bg: "bg-amber-50", icon: Trophy },
  Trusted: { color: "text-blue-600", bg: "bg-blue-50", icon: Shield },
  Regular: { color: "text-emerald-600", bg: "bg-emerald-50", icon: Star },
  Newcomer: { color: "text-zinc-500", bg: "bg-zinc-50", icon: User },
}

const RANK_MEDALS: Record<number, { emoji: string; color: string }> = {
  1: { emoji: "🥇", color: "from-amber-400 to-yellow-500" },
  2: { emoji: "🥈", color: "from-zinc-300 to-zinc-400" },
  3: { emoji: "🥉", color: "from-amber-600 to-amber-700" },
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reputation")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
        <p className="text-zinc-500 text-sm">
          Top community members by reputation points
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-zinc-100 rounded-2xl">
              <div className="h-12 w-12 rounded-full bg-zinc-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-1/3" />
                <div className="h-3 bg-zinc-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No members yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Earn reputation by participating in the community!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {top3.map((entry) => {
                const medal = RANK_MEDALS[entry.rank]
                const tierConfig = TIER_CONFIG[entry.tier]
                const TierIcon = tierConfig?.icon || User
                return (
                  <Card
                    key={entry.id}
                    className={`overflow-hidden ${
                      entry.rank === 1 ? "ring-2 ring-amber-400" : ""
                    }`}
                  >
                    <div className={`bg-gradient-to-br ${medal?.color || "from-zinc-200 to-zinc-300"} p-4 text-center`}>
                      <span className="text-3xl">{medal?.emoji}</span>
                    </div>
                    <CardContent className="p-4 text-center">
                      <Avatar className="h-10 w-10 sm:h-14 sm:w-14 mx-auto -mt-10 ring-4 ring-white">
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-lg font-bold">
                          {entry.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-sm mt-2 truncate">
                        {entry.name}
                      </h3>
                      {entry.zone && (
                        <p className="text-[10px] text-zinc-400 truncate">{entry.zone}</p>
                      )}
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <TierIcon className={`h-3 w-3 ${tierConfig?.color}`} />
                        <span className={`text-xs font-medium ${tierConfig?.color}`}>
                          {entry.tier}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-emerald-600 mt-1">
                        {entry.reputationPoints.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-zinc-400">points</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {rest.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                All Members ({entries.length})
              </h2>
              <div className="space-y-2">
                {entries.map((entry) => {
                  const tierConfig = TIER_CONFIG[entry.tier]
                  const TierIcon = tierConfig?.icon || User
                  return (
                    <Card key={entry.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 text-center shrink-0">
                            <span className="text-sm font-bold text-zinc-400">
                              #{entry.rank}
                            </span>
                          </div>
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="text-sm">
                              {entry.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {entry.name}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tierConfig?.bg} ${tierConfig?.color}`}
                              >
                                <TierIcon className="h-2.5 w-2.5" />
                                {entry.tier}
                              </span>
                            </div>
                            {entry.zone && (
                              <p className="text-xs text-zinc-400 truncate">{entry.zone}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-emerald-600">
                              {entry.reputationPoints.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-zinc-400">pts</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
