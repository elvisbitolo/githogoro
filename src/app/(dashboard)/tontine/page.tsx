"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Clock, CheckCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface TontineGroup {
  id: string
  name: string
  description: string | null
  contributionAmount: number
  frequency: string
  maxMembers: number
  currentCycle: number
  totalCycles: number
  status: string
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null }
  members: { id: string }[]
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "paused", label: "Paused" },
]

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  paused: "bg-amber-100 text-amber-700",
}

export default function TontinePage() {
  const [groups, setGroups] = useState<TontineGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== "all") params.set("status", statusFilter)

    fetch(`/api/tontine?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGroups(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tontine Groups</h1>
        <Link
          href="/tontine/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Group
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-40" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No tontine groups found</p>
            <p className="text-sm text-zinc-400 mt-1">Create or join a savings group!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groups.map((g) => (
            <Link key={g.id} href={`/tontine/${g.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{g.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[g.status]}`}>
                      {g.status}
                    </span>
                  </div>
                  {g.description && (
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{g.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {g.members.length}/{g.maxMembers}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {g.frequency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                    <p className="text-emerald-700 font-semibold text-sm">
                      Ksh {g.contributionAmount.toLocaleString()}/{g.frequency.slice(0, -2) || "cycle"}
                    </p>
                    <span className="text-[10px] text-zinc-400">Cycle {g.currentCycle}/{g.totalCycles}</span>
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
