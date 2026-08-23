"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  targetType: string
  targetId: string
  reason: string
  details: string | null
  status: "pending" | "reviewed" | "actioned" | "dismissed"
  createdAt: string
  handledAt: string | null
  reporter?: { id: string; name: string }
  handledBy?: { id: string; name: string } | null
}

const STATUS_FILTERS = [
  { value: "pending", label: "Pending", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "reviewed", label: "Reviewed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "actioned", label: "Actioned", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "dismissed", label: "Dismissed", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
]

const STATUS_ACTIONS: { status: Report["status"]; label: string; variant: "default" | "destructive" | "ghost" }[] = [
  { status: "reviewed", label: "Mark reviewed", variant: "default" },
  { status: "actioned", label: "Action taken", variant: "default" },
  { status: "dismissed", label: "Dismiss", variant: "ghost" },
]

const TYPE_COLORS: Record<string, string> = {
  user: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  post: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  message: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  marketplace: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  business: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  comment: "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [updating, setUpdating] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/admin/reports?status=${filter}`)
      const data = await res.json()
      if (!cancelled) {
        if (Array.isArray(data)) setReports(data)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [filter, refreshKey])

  const handleStatus = async (report: Report, status: Report["status"]) => {
    setUpdating(report.id)
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      } else {
        const err = await res.json().catch(() => ({ error: "Failed" }))
        alert(`Error: ${err.error || "Failed to update report"}`)
      }
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mr-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h1 className="text-xl font-bold">Reports</h1>
            <Badge variant="outline" className="text-zinc-500">{reports.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === s.value ? s.color : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {filter === "pending" ? "Waiting for review" : `${filter} reports`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-zinc-800/50 animate-pulse" />
              ))
            ) : reports.length === 0 ? (
              <p className="text-sm text-zinc-600">No {filter} reports.</p>
            ) : (
              reports.map((report) => {
                const typeColor = TYPE_COLORS[report.targetType] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                const statusColor = STATUS_FILTERS.find((s) => s.value === report.status)?.color
                return (
                  <div key={report.id} className="rounded-lg bg-zinc-800/50 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className={typeColor}>{report.targetType}</Badge>
                        {statusColor && <Badge variant="outline" className={statusColor}>{report.status}</Badge>}
                        <span className="text-zinc-500">
                          Reported by <span className="text-zinc-300">{report.reporter?.name || "Unknown"}</span>
                        </span>
                        <span className="text-zinc-600">{new Date(report.createdAt).toLocaleString()}</span>
                      </div>
                      {report.handledBy && (
                        <span className="text-[10px] text-zinc-600">
                          handled by {report.handledBy.name} · {report.handledAt ? new Date(report.handledAt).toLocaleString() : ""}
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-300 font-medium mb-1">{report.reason}</p>
                    {report.details && (
                      <p className="text-zinc-500 text-xs whitespace-pre-wrap mb-2">{report.details}</p>
                    )}
                    <p className="text-[10px] text-zinc-600 font-mono mb-3">Target: {report.targetId}</p>

                    {report.status !== "dismissed" && report.status !== "actioned" && (
                      <div className="flex flex-wrap items-center gap-2">
                        {updating === report.id ? (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs px-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                          </div>
                        ) : (
                          STATUS_ACTIONS.map((action) => (
                            <Button
                              key={action.status}
                              size="sm"
                              variant={action.variant}
                              onClick={() => handleStatus(report, action.status)}
                              disabled={report.status === action.status}
                              className={action.variant === "default" ? "bg-zinc-700 hover:bg-zinc-600" : undefined}
                            >
                              {action.label}
                            </Button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
