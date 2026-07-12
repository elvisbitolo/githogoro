"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ArrowLeft, Users, MessageSquare, Briefcase } from "lucide-react"
import Link from "next/link"

export default function AdminAnalyticsPage() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalJobs, setTotalJobs] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [totalBusinesses, setTotalBusinesses] = useState(0)
  const [totalEvents, setTotalEvents] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const [
        { count: uc },
        { count: jc },
        { count: mc },
        { count: bc },
        { count: ec },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
      ])
      setTotalUsers(uc || 0)
      setTotalJobs(jc || 0)
      setTotalMessages(mc || 0)
      setTotalBusinesses(bc || 0)
      setTotalEvents(ec || 0)
    })()
  }, [supabase])

  const metrics = [
    { label: "Total Users", value: totalUsers, icon: Users, change: "+0% this week" },
    { label: "Total Jobs", value: totalJobs, icon: Briefcase, change: "+0% this week" },
    { label: "Total Messages", value: totalMessages, icon: MessageSquare, change: "+0% this week" },
    { label: "Total Businesses", value: totalBusinesses, icon: TrendingUp, change: "+0% this week" },
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
                <m.icon className="h-5 w-5 text-zinc-500 mb-2" />
                <div className="text-2xl font-bold text-white">{m.value}</div>
                <div className="text-xs text-zinc-500">{m.label}</div>
                <div className="text-xs text-zinc-600 mt-1">{m.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-500">
              <p>Total Events: {totalEvents || 0}</p>
              <p className="mt-1">Detailed analytics dashboard coming soon with charts and user growth tracking.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
