"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

interface Complaint {
  id: string
  title: string
  description: string
  category: string | null
  status: string
  isAnonymous: boolean
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
  _count: { comments: number }
}

const statusColors: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  acknowledged: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  resolved: "bg-emerald-100 text-emerald-800",
  dismissed: "bg-zinc-100 text-zinc-600",
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== "all") params.set("status", filter)

    fetch(`/api/governance/complaints?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setComplaints(Array.isArray(data) ? data : []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Complaints</h1>
          <p className="text-sm text-zinc-500 mt-1">Submit and track complaints</p>
        </div>
        <Link href="/governance/complaints/new">
          <button className="inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-800 transition-colors">
            New Complaint
          </button>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {["all", "open", "acknowledged", "in_progress", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-12">No complaints found</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Link key={c.id} href={`/governance/complaints/${c.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-zinc-900">{c.title}</h3>
                    <span className={`whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] || "bg-zinc-100 text-zinc-600"}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-2">{c.description}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{c.isAnonymous ? "Anonymous" : c.user.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {c._count.comments}
                      </span>
                      <span>{formatRelativeTime(c.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
