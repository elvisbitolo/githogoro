"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Briefcase, Users, Bell } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/i18n/context"

export default function DashboardPage() {
  const { t } = useTranslations()
  const [userName, setUserName] = useState("")
  const [messageCount, setMessageCount] = useState(0)
  const [jobCount, setJobCount] = useState(0)
  const [recentJobs, setRecentJobs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserName(data.user.user_metadata?.name || "")
    })

    supabase.from("private_messages").select("*", { count: "exact", head: true }).limit(0).then(({ count }) => {
      if (count !== null) setMessageCount(count)
    })

    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true).limit(0).then(({ count }) => {
      if (count !== null) setJobCount(count)
    })

    supabase.from("jobs").select("title, location, created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(3).then(({ data }) => {
      if (data) setRecentJobs(data)
    })
  }, [supabase])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t.dashboard.welcome}, {userName || t.dashboard.resident}!</h1>
        <p className="text-zinc-500 mt-1">{t.dashboard.whatsup}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t.dashboard.messages, value: messageCount, icon: MessageSquare, href: "/messages", color: "text-emerald-600" },
          { label: t.dashboard.activeJobs, value: jobCount, icon: Briefcase, href: "/jobs", color: "text-amber-600" },
          { label: t.dashboard.nearby, value: t.dashboard.live, icon: Users, href: "/map", color: "text-blue-600" },
          { label: t.dashboard.alerts, value: t.dashboard.active, icon: Bell, href: "/alerts", color: "text-red-600" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-sm text-zinc-500">{item.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">{t.dashboard.recentJobs}</h3>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent jobs.</p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job, i) => (
                  <Link key={i} href="/jobs" className="block p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                    <p className="font-medium text-sm">{job.title}</p>
                    {job.location && <p className="text-xs text-zinc-400 mt-0.5">{job.location}</p>}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-1">{t.dashboard.communityUpdates}</h3>
            <p className="text-sm text-zinc-500">{t.dashboard.noUpdates}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
