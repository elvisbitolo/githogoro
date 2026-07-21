"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  TrendingUp, ArrowLeft, Users, MessageSquare, Briefcase,
  Calendar, Package, MapPin, AlertTriangle, Activity,
} from "lucide-react"
import Link from "next/link"

interface Stats {
  users: number
  jobs: number
  messages: number
  businesses: number
  alerts: number
  events: number
  bundles: number
  places: number
  videos: number
  recentUsers: number
  recentMessages: number
  recentJobs: number
  recentBusinesses: number
  userGrowthPercent: number
  messageGrowthPercent: number
  recentRegistrations: { name: string; phone: string; createdAt: string }[]
  mostActiveUsers: { name: string; messageCount: number; zone: string | null }[]
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
  }, [])

  if (!stats) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const metrics = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400", growth: stats.userGrowthPercent, sub: `+${stats.recentUsers} this week` },
    { label: "Total Messages", value: stats.messages, icon: MessageSquare, color: "text-emerald-400", growth: stats.messageGrowthPercent, sub: `+${stats.recentMessages} this week` },
    { label: "Total Jobs", value: stats.jobs, icon: Briefcase, color: "text-amber-400", sub: `+${stats.recentJobs} this week` },
    { label: "Total Businesses", value: stats.businesses, icon: TrendingUp, color: "text-purple-400", sub: `+${stats.recentBusinesses} this week` },
    { label: "Total Events", value: stats.events, icon: Calendar, color: "text-cyan-400" },
    { label: "Total Bundles", value: stats.bundles, icon: Package, color: "text-orange-400" },
    { label: "Community Places", value: stats.places, icon: MapPin, color: "text-pink-400" },
    { label: "Alerts Sent", value: stats.alerts, icon: AlertTriangle, color: "text-red-400" },
  ]

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          <h1 className="text-xl font-bold">Analytics</h1>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => (
            <Card key={m.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <m.icon className={`h-5 w-5 ${m.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{m.value.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">{m.label}</div>
                <div className="flex items-center gap-2 mt-1">
                  {m.growth !== undefined && (
                    <span className={`text-xs ${m.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {m.growth >= 0 ? "+" : ""}{m.growth.toFixed(1)}%
                    </span>
                  )}
                  {m.sub && (
                    <span className="text-xs text-zinc-600">{m.sub}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Recent Registrations (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.recentRegistrations.length === 0 ? (
                <p className="text-sm text-zinc-600">No recent registrations.</p>
              ) : (
                stats.recentRegistrations.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-3 py-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-zinc-700 text-zinc-400 text-xs">
                        {user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-zinc-600">{user.phone}</p>
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Most Active Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.mostActiveUsers.length === 0 ? (
                <p className="text-sm text-zinc-600">No activity data yet.</p>
              ) : (
                stats.mostActiveUsers.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-3 py-2">
                    <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      {user.zone && <p className="text-xs text-zinc-600">{user.zone}</p>}
                    </div>
                    <Badge variant="outline" className="text-zinc-400 shrink-0">
                      {user.messageCount} msgs
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
