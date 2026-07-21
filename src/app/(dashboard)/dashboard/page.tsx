"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Briefcase,
  Users,
  Bell,
  Calendar,
  MapPin,
  Clock,
  GraduationCap,
  Heart,
  Newspaper,
  ExternalLink,
  Cloud,
  Sun,
  CloudRain,
  CloudSun,
  Sparkles,
  MessageCircle,
  Phone,
  Star,
  Shield,
  Store,
  TrendingUp,
  Zap,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/i18n/context"

interface DashboardStats {
  messages: number
  jobs: number
  users: number
  alerts: number
}

interface UserProfile {
  id: string
  createdAt: string
}

interface ActivityItem {
  id: string
  type: string
  title: string
  timestamp: string
  href: string
}

interface PartnerNews {
  title: string
  description: string
  category: string
  year: string
}

interface NearbyResident {
  id: string
  name: string
  phone: string | null
  zone: string | null
  avatarUrl: string | null
  isVerified: boolean
  role: string
  lastActiveAt: string | null
}

const DAILY_QUOTES = [
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
  { text: "Unity is strength... when there is teamwork and collaboration, wonderful things can be achieved.", author: "Mattie Stepanek" },
  { text: "A community is like a ship; everyone ought to be prepared to take the helm.", author: "Henrik Ibsen" },
  { text: "The strength of the team is each individual member. The strength of each member is the team.", author: "Phil Jackson" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
  { text: "None of us is as smart as all of us.", author: "Ken Blanchard" },
  { text: "Coming together is a beginning, staying together is progress, and working together is success.", author: "Henry Ford" },
  { text: "Tuko pamoja — We are together.", author: "Githogoro Connect" },
  { text: "Umoja ni nguvu — Unity is strength.", author: "Swahili Proverb" },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getGreetingEmoji() {
  const hour = new Date().getHours()
  if (hour < 12) return "🌅"
  if (hour < 17) return "☀️"
  return "🌙"
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  return `${days}d ago`
}

function getDailyQuote() {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}

function getWeatherIcon(condition: string) {
  switch (condition) {
    case "sunny": return Sun
    case "cloudy": return Cloud
    case "rainy": return CloudRain
    default: return CloudSun
  }
}

export default function DashboardPage() {
  const { t } = useTranslations()
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState<DashboardStats>({ messages: 0, jobs: 0, users: 0, alerts: 0 })
  const [recentJobs, setRecentJobs] = useState<{ title: string; location: string | null; createdAt: string }[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [partnerNews, setPartnerNews] = useState<PartnerNews[]>([])
  const [nearbyResidents, setNearbyResidents] = useState<NearbyResident[]>([])
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<{ temp: number; condition: string; humidity: number }>({ temp: 24, condition: "sunny", humidity: 65 })
  const [quote] = useState(getDailyQuote)
  const [myId, setMyId] = useState("")
  const [isNewUser, setIsNewUser] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(data.user.user_metadata?.name || data.user.email?.split("@")[0] || "")
        setMyId(data.user.id)
      }
    })

    Promise.all([
      fetch("/api/profiles/me").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/admin/stats").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/jobs").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/alerts").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/partners").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/profiles").then((res) => (res.ok ? res.json() : null)),
    ]).then(([myProfile, statsData, jobsData, alertsData, partnersData, profilesData]) => {
      let userIsNew = false
      if (myProfile?.createdAt) {
        const profileCreated = new Date(myProfile.createdAt).getTime()
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
        userIsNew = profileCreated > twentyFourHoursAgo
        setIsNewUser(userIsNew)
      }
      if (statsData) {
        setStats({
          messages: myProfile?.stats?.messagesSent ?? 0,
          jobs: statsData.jobs || 0,
          users: statsData.users || 0,
          alerts: statsData.alerts || 0,
        })
      }
      if (jobsData) {
        const jobs = Array.isArray(jobsData) ? jobsData : []
        setRecentJobs(jobs.slice(0, 4))
        const jobActivities: ActivityItem[] = jobs.slice(0, 2).map((job: any) => ({
          id: job.id,
          type: "job",
          title: `New job: ${job.title}`,
          timestamp: job.createdAt,
          href: "/jobs",
        }))
        setActivities((prev) => [...prev, ...jobActivities])
      }
      if (alertsData) {
        const alertList = alertsData?.alerts ?? (Array.isArray(alertsData) ? alertsData : [])
        const alertActivities: ActivityItem[] = alertList.slice(0, 2).map((alert: any) => ({
          id: alert.id,
          type: "alert",
          title: `Alert: ${alert.title}`,
          timestamp: alert.createdAt,
          href: "/alerts",
        }))
        setActivities((prev) => [...prev, ...alertActivities])
      }
      if (partnersData?.items) {
        setPartnerNews(partnersData.items.slice(0, 3))
      }
      if (Array.isArray(profilesData)) {
        setNearbyResidents(
          profilesData
            .filter((p: any) => p.id !== myId)
            .sort((a: any, b: any) => {
              if (a.lastActiveAt && !b.lastActiveAt) return -1
              if (!a.lastActiveAt && b.lastActiveAt) return 1
              return new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime()
            })
            .slice(0, 8)
        )
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [supabase])

  const quickActions = [
    { label: "Post Job", icon: Briefcase, href: "/jobs/new", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
    { label: "Create Event", icon: Calendar, href: "/events/new", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
    { label: "Report Place", icon: MapPin, href: "/map", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
    { label: "Invite Friend", icon: Users, href: "/invite", color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" },
    { label: "Sell Item", icon: Store, href: "/marketplace/new", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
    { label: "Start Chat", icon: MessageCircle, href: "/chat/new", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
  ]

  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const WeatherIcon = getWeatherIcon(weather.condition)

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-xl mb-8" />
        <div className="grid sm:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Hero Card */}
      <Card className="mb-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 overflow-hidden relative">
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">{getGreetingEmoji()} {getGreeting()}</p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                {userName || t.dashboard.resident}
              </h1>
              <p className="text-emerald-100 mt-2 text-sm">{t.dashboard.whatsup}</p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1.5 text-emerald-100">
                <WeatherIcon className="h-5 w-5" />
                <span className="text-lg font-bold">{weather.temp}°C</span>
              </div>
              <p className="text-emerald-200 text-xs">Githogoro</p>
            </div>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </Card>

      {/* Daily Quote */}
      <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-700 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-zinc-500 mt-1">— {quote.author}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Card for New Users */}
      {isNewUser && (
        <Card className="mb-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">{t.dashboard.onboardingTitle}</h3>
                <p className="text-xs text-zinc-500">{t.dashboard.onboardingDesc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/chat">
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  <MessageCircle className="h-3 w-3" /> {t.dashboard.onboardingChat}
                </Button>
              </Link>
              <Link href="/map">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <MapPin className="h-3 w-3" /> {t.dashboard.onboardingExplore}
                </Button>
              </Link>
              <Link href="/feed">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <BookOpen className="h-3 w-3" /> {t.dashboard.onboardingPost}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: t.dashboard.activeJobs, value: stats.jobs, icon: Briefcase, href: "/jobs", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Community", value: stats.users, icon: Users, href: "/people", color: "text-blue-600", bg: "bg-blue-50" },
          { label: t.dashboard.alerts, value: stats.alerts, icon: Bell, href: "/alerts", color: "text-red-600", bg: "bg-red-50" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 sm:p-5">
                <div className={`h-9 w-9 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="text-2xl font-bold text-zinc-900">{item.value}</div>
                <div className="text-sm text-zinc-500">{item.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-zinc-700 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              variant="outline"
              className={`w-full justify-start gap-2 h-auto py-3 border ${action.color} transition-all duration-200`}
            >
              <action.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>

      {/* Community News */}
      {partnerNews.length > 0 && (
        <Card className="mb-6 border-2 border-blue-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-zinc-900">Community News</h3>
                <Badge className="bg-blue-100 text-blue-700 text-[10px]">Brilliant Angels</Badge>
              </div>
              <a href="https://brilliant-angel-cbo.vercel.app/news" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="text-xs gap-1 text-blue-600 hover:text-blue-700">
                  View All <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
            <div className="space-y-3">
              {partnerNews.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-600">{item.year.slice(-2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{item.category}</span>
                      <span className="text-[10px] text-zinc-400">{item.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* People Nearby + Activity */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* People Nearby */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <h3 className="font-semibold text-zinc-900">People Nearby</h3>
              </div>
              <Link href="/people">
                <Button size="sm" variant="ghost" className="text-xs gap-1 text-emerald-600">
                  View All <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            {nearbyResidents.length === 0 ? (
              <p className="text-sm text-zinc-500">No community members yet</p>
            ) : (
              <div className="space-y-2">
                {nearbyResidents.map((resident) => {
                  const isOnline = resident.lastActiveAt &&
                    new Date(resident.lastActiveAt).getTime() > Date.now() - 5 * 60 * 1000
                  return (
                    <div key={resident.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={resident.avatarUrl || undefined} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                            {(resident.name || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-zinc-900 truncate">{resident.name}</p>
                          {resident.isVerified && (
                            <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-emerald-100">
                              <svg className="h-2 w-2 text-emerald-700" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                              </svg>
                            </span>
                          )}
                          {resident.role === "admin" && (
                            <Shield className="h-3 w-3 text-amber-500" />
                          )}
                          {resident.role === "business" && (
                            <Store className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-zinc-500">{resident.zone || "Githogoro"}</p>
                          {resident.lastActiveAt && (
                            <span className={`text-[10px] ${isOnline ? "text-green-600" : "text-zinc-400"}`}>
                              {isOnline ? "online" : timeAgo(resident.lastActiveAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link href={`/chat/new`}>
                          <button className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                          </button>
                        </Link>
                        {resident.phone && (
                          <a href={`tel:${resident.phone}`}>
                            <button className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
                              <Phone className="h-3.5 w-3.5 text-blue-600" />
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-zinc-900">Recent Activity</h3>
              </div>
              <Clock className="h-4 w-4 text-zinc-400" />
            </div>
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.dashboard.noUpdates}</p>
            ) : (
              <div className="space-y-3">
                {sortedActivities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === "job" ? "bg-amber-50" : "bg-red-50"
                    }`}>
                      {activity.type === "job" ? (
                        <Briefcase className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Bell className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{activity.title}</p>
                      <p className="text-xs text-zinc-400">{timeAgo(activity.timestamp)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Community Spotlight */}
      <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Community Spotlight</h3>
              <p className="text-xs text-zinc-500">Partner Organisation</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600 mb-3">
            <strong>Brilliant Angels Academy</strong> — transforming Githogoro through education, youth empowerment, and community development since 2018.
          </p>
          <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-zinc-500">
            <span>📖 Scholarships</span>
            <span>🌱 Environment</span>
            <span>⚽ Sports</span>
            <span>💪 Youth Training</span>
          </div>
          <div className="flex gap-2">
            <a href="https://brilliant-angel-cbo.vercel.app" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <ExternalLink className="h-3 w-3" /> Visit Site
              </Button>
            </a>
            <Link href="/partners">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                View All Partners
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-zinc-900">Recent Jobs</h3>
              </div>
              <Link href="/jobs">
                <Button size="sm" variant="ghost" className="text-xs gap-1 text-amber-600">
                  View All <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentJobs.map((job, i) => (
                <Link
                  key={i}
                  href="/jobs"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Briefcase className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{job.title}</p>
                    <div className="flex items-center gap-2">
                      {job.location && <p className="text-xs text-zinc-500">{job.location}</p>}
                      <span className="text-[10px] text-zinc-400">{timeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
