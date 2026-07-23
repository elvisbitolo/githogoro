"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Search, Shield, Clock, User, Trash2, CheckCircle,
  Star, Megaphone, MapPin, Briefcase, AlertTriangle, Settings,
} from "lucide-react"
import Link from "next/link"

interface AuditEntry {
  id: string
  action: string
  targetId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
  admin: { name: string }
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: typeof Trash2 }> = {
  delete_user: { label: "Deleted User", color: "bg-red-500/20 text-red-400", icon: Trash2 },
  delete_message: { label: "Deleted Message", color: "bg-red-500/20 text-red-400", icon: Trash2 },
  delete_post: { label: "Deleted Post", color: "bg-red-500/20 text-red-400", icon: Trash2 },
  delete_business: { label: "Deleted Business", color: "bg-red-500/20 text-red-400", icon: Trash2 },
  change_role: { label: "Changed Role", color: "bg-blue-500/20 text-blue-400", icon: Settings },
  toggle_verify: { label: "Toggled Verify", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle },
  approve_place: { label: "Approved Place", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle },
  reject_place: { label: "Rejected Place", color: "bg-amber-500/20 text-amber-400", icon: AlertTriangle },
  feature_business: { label: "Featured Business", color: "bg-purple-500/20 text-purple-400", icon: Star },
  unfeature_business: { label: "Unfeatured Business", color: "bg-zinc-500/20 text-zinc-400", icon: Star },
  adjust_reputation: { label: "Adjusted Reputation", color: "bg-amber-500/20 text-amber-400", icon: Star },
  send_announcement: { label: "Sent Announcement", color: "bg-cyan-500/20 text-cyan-400", icon: Megaphone },
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("")

  useEffect(() => {
    fetch("/api/admin/audit-log?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = entries.filter((e) => {
    const matchesSearch = !search ||
      e.admin?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.targetId?.toLowerCase().includes(search.toLowerCase())
    const matchesAction = !actionFilter || e.action === actionFilter
    return matchesSearch && matchesAction
  })

  const actionTypes = [...new Set(entries.map((e) => e.action))]

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-5 w-5 text-zinc-400" />
          <h1 className="text-xl font-bold">Admin Audit Log</h1>
          <Badge variant="outline" className="text-zinc-500">{filtered.length}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100"
          >
            <option value="">All Actions</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>{ACTION_CONFIG[a]?.label || a}</option>
            ))}
          </select>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-zinc-800/50 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">No audit log entries found.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filtered.map((entry) => {
                  const config = ACTION_CONFIG[entry.action]
                  const Icon = config?.icon || Settings
                  return (
                    <div key={entry.id} className="flex items-center gap-4 px-4 py-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config?.color || "bg-zinc-700 text-zinc-400"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{config?.label || entry.action}</span>
                          {entry.targetId && (
                            <span className="text-xs text-zinc-600 font-mono truncate">{entry.targetId.slice(0, 8)}...</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span>by {entry.admin?.name || "Admin"}</span>
                          {entry.ipAddress && <span>from {entry.ipAddress}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-600 shrink-0">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
