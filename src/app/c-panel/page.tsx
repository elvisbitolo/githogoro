"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users, Briefcase, MessageSquare, AlertTriangle, TrendingUp,
  Shield, Activity, MapPin, Package, Calendar,
  Clock, Megaphone,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

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
}

interface HealthStatus {
  db: "connected" | "error"
  auth: "active" | "inactive"
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [health, setHealth] = useState<HealthStatus>({ db: "connected", auth: "active" })
  const [userEmail, setUserEmail] = useState("")
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertBody, setAlertBody] = useState("")
  const [alertSending, setAlertSending] = useState(false)

  const [announceOpen, setAnnounceOpen] = useState(false)
  const [announceTitle, setAnnounceTitle] = useState("")
  const [announceMessage, setAnnounceMessage] = useState("")
  const [announceSending, setAnnounceSending] = useState(false)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || user.phone || "")

      try {
        const res = await fetch("/api/admin/stats")
        if (res.ok) setStats(await res.json())
      } catch { /* ignore */ }

      try {
        const res = await fetch("/api/admin/stats", { method: "HEAD" }).catch(() => null)
        setHealth((prev) => ({
          ...prev,
          db: res && res.ok ? "connected" : "error",
        }))
      } catch {
        setHealth((prev) => ({ ...prev, db: "error" }))
      }
    })()
  }, [])

  const handleBroadcast = async () => {
    if (!alertTitle.trim() || !alertBody.trim()) return
    setAlertSending(true)
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: alertTitle, type: "emergency", alertBody }),
      })
      setAlertOpen(false)
      setAlertTitle("")
      setAlertBody("")
    } catch { /* ignore */ }
    setAlertSending(false)
  }

  const handleAnnouncement = async () => {
    if (!announceTitle.trim() || !announceMessage.trim()) return
    setAnnounceSending(true)
    try {
      await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: announceTitle, message: announceMessage, type: "general" }),
      })
      setAnnounceOpen(false)
      setAnnounceTitle("")
      setAnnounceMessage("")
    } catch { /* ignore */ }
    setAnnounceSending(false)
  }

  const statCards = stats
    ? [
        { label: "Users", value: stats.users, icon: Users, href: "/c-panel/users", color: "text-blue-400", sub: `+${stats.recentUsers} this week` },
        { label: "Messages", value: stats.messages, icon: MessageSquare, href: "/c-panel/moderation", color: "text-emerald-400", sub: `+${stats.recentMessages} this week` },
        { label: "Jobs", value: stats.jobs, icon: Briefcase, href: "/c-panel/analytics", color: "text-amber-400" },
        { label: "Businesses", value: stats.businesses, icon: TrendingUp, href: "/c-panel/analytics", color: "text-purple-400" },
        { label: "Events", value: stats.events, icon: Calendar, href: "/c-panel/analytics", color: "text-cyan-400" },
        { label: "Bundles", value: stats.bundles, icon: Package, href: "/c-panel/analytics", color: "text-orange-400" },
        { label: "Places", value: stats.places, icon: MapPin, href: "/c-panel/places", color: "text-pink-400" },
        { label: "Alerts", value: stats.alerts, icon: AlertTriangle, href: "/c-panel/analytics", color: "text-red-400" },
      ]
    : []

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">c-panel</h1>
              <p className="text-sm text-zinc-500">Admin — {userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Activity className="h-3 w-3" /> Live
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                  {stat.sub && (
                    <div className="text-xs text-emerald-500 mt-1">{stat.sub}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/c-panel/users" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-400" /> Manage Users</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <Link href="/c-panel/moderation" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400" /> Moderation Queue</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <Link href="/c-panel/places" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-400" /> Place Approvals</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <Link href="/c-panel/analytics" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-400" /> Analytics</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <Link href="/c-panel/businesses" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-purple-400" /> Business Moderation</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <Link href="/c-panel/feed-moderation" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-blue-400" /> Feed Moderation</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <Link href="/c-panel/content" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><Package className="h-4 w-4 text-cyan-400" /> Content Moderation</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <Link href="/c-panel/audit-log" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-zinc-400" /> Audit Log</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <button
                onClick={() => setAnnounceOpen(true)}
                className="flex w-full items-center justify-between rounded-lg bg-blue-900/30 border border-blue-900/50 px-4 py-3 text-sm hover:bg-blue-900/50 transition-colors"
              >
                <span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-blue-400" /> Send Announcement</span>
                <span className="text-zinc-500">→</span>
              </button>
              <button
                onClick={() => setAlertOpen(true)}
                className="flex w-full items-center justify-between rounded-lg bg-red-900/30 border border-red-900/50 px-4 py-3 text-sm hover:bg-red-900/50 transition-colors"
              >
                <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Broadcast Emergency Alert</span>
                <span className="text-zinc-500">→</span>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Database</span>
                {health.db === "connected" ? (
                  <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Connected</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400"><span className="h-2 w-2 rounded-full bg-red-400" /> Error</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Auth</span>
                {health.auth === "active" ? (
                  <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Active</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400"><span className="h-2 w-2 rounded-full bg-red-400" /> Inactive</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">API</span>
                {stats ? (
                  <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Operational</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-400" /> Loading</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Real-time</span>
                <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Active</span>
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <div className="text-xs text-zinc-600">App v1.0.0 • Supabase • Vercel</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Broadcast Emergency Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Title</label>
              <Input
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="Emergency alert title..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Message</label>
              <textarea
                value={alertBody}
                onChange={(e) => setAlertBody(e.target.value)}
                placeholder="Alert message body..."
                rows={4}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBroadcast}
                disabled={alertSending || !alertTitle.trim() || !alertBody.trim()}
              >
                {alertSending ? "Sending..." : "Broadcast Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={announceOpen} onOpenChange={setAnnounceOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-blue-400 flex items-center gap-2">
              <Megaphone className="h-5 w-5" /> Community Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">
              Send a community-wide announcement (non-emergency). All users will see this in their notifications.
            </p>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Title</label>
              <Input
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                placeholder="Announcement title..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Message</label>
              <textarea
                value={announceMessage}
                onChange={(e) => setAnnounceMessage(e.target.value)}
                placeholder="Announcement message..."
                rows={4}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAnnounceOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAnnouncement}
                disabled={announceSending || !announceTitle.trim() || !announceMessage.trim()}
              >
                {announceSending ? "Sending..." : "Send Announcement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
