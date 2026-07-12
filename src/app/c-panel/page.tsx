"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, MessageSquare, AlertTriangle, TrendingUp, Shield, Activity, Database } from "lucide-react"
import Link from "next/link"

export default function AdminPanelPage() {
  const [stats, setStats] = useState([
    { label: "Users", value: 0, icon: Users, href: "/c-panel/users", color: "text-blue-600" },
    { label: "Jobs", value: 0, icon: Briefcase, href: "/c-panel/moderation", color: "text-amber-600" },
    { label: "Messages", value: 0, icon: MessageSquare, href: "/c-panel/moderation", color: "text-emerald-600" },
    { label: "Businesses", value: 0, icon: TrendingUp, href: "/c-panel/moderation", color: "text-purple-600" },
    { label: "Alerts", value: 0, icon: AlertTriangle, href: "/c-panel/moderation", color: "text-red-600" },
  ])
  const [userEmail, setUserEmail] = useState("")
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || user.phone || "")
      const [
        { count: uc },
        { count: jc },
        { count: mc },
        { count: bc },
        { count: ac },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("alerts").select("*", { count: "exact", head: true }),
      ])
      setStats([
        { label: "Users", value: uc || 0, icon: Users, href: "/c-panel/users", color: "text-blue-600" },
        { label: "Jobs", value: jc || 0, icon: Briefcase, href: "/c-panel/moderation", color: "text-amber-600" },
        { label: "Messages", value: mc || 0, icon: MessageSquare, href: "/c-panel/moderation", color: "text-emerald-600" },
        { label: "Businesses", value: bc || 0, icon: TrendingUp, href: "/c-panel/moderation", color: "text-purple-600" },
        { label: "Alerts", value: ac || 0, icon: AlertTriangle, href: "/c-panel/moderation", color: "text-red-600" },
      ])
    })()
  }, [supabase])

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardContent className="p-4">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
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
              <Link href="/c-panel/analytics" className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
                <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-400" /> Analytics</span>
                <span className="text-zinc-500">→</span>
              </Link>
              <button className="flex w-full items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 text-sm hover:bg-zinc-800 transition-colors">
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
                <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Connected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Auth</span>
                <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Storage</span>
                <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Operational</span>
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
    </div>
  )
}
