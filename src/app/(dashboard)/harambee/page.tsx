"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Users, CheckCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Campaign {
  id: string
  title: string
  description: string | null
  goalAmount: number
  raisedAmount: number
  status: string
  category: string
  isVerified: boolean
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null }
  donations: { id: string }[]
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "funded", label: "Funded" },
  { key: "closed", label: "Closed" },
]

const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "general", label: "General" },
  { key: "medical", label: "Medical" },
  { key: "education", label: "Education" },
  { key: "funeral", label: "Funeral" },
  { key: "business", label: "Business" },
  { key: "other", label: "Other" },
]

const GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
]

export default function HarambeePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (categoryFilter !== "all") params.set("category", categoryFilter)

    fetch(`/api/harambee?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCampaigns(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter, categoryFilter])

  function getProgress(raised: number, goal: number) {
    return Math.min((raised / goal) * 100, 100)
  }

  const STATUS_BADGE: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    funded: "bg-blue-100 text-blue-700",
    closed: "bg-zinc-200 text-zinc-500",
    cancelled: "bg-red-100 text-red-700",
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Harambee</h1>
        <Link
          href="/harambee/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Start Campaign
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.key
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setCategoryFilter(f.key)}
            className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === f.key
                ? "bg-zinc-800 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-56" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No campaigns found</p>
            <p className="text-sm text-zinc-400 mt-1">Start a campaign to help someone in need!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {campaigns.map((c) => {
            const progress = getProgress(c.raisedAmount, c.goalAmount)
            return (
              <Link key={c.id} href={`/harambee/${c.id}`}>
                <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
                  <div className={`h-28 bg-gradient-to-br ${GRADIENTS[c.title.charCodeAt(0) % GRADIENTS.length]} flex items-center justify-center relative`}>
                    <Heart className="h-10 w-10 text-white/60" />
                    <span className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[c.status]}`}>
                      {c.status}
                    </span>
                    {c.isVerified && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 text-[10px] text-white bg-white/20 rounded-full px-2 py-0.5">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">by {c.creator.name}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-emerald-700 font-semibold">Ksh {c.raisedAmount.toLocaleString()}</span>
                        <span className="text-zinc-400">of Ksh {c.goalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-zinc-400">{c.donations.length} donors</span>
                      <span className="text-[10px] text-zinc-400">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
