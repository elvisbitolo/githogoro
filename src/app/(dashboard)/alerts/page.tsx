"use client"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Bell, Clock, Plus, Check, Loader2 } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Alert {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [newType, setNewType] = useState("general")

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("type", filter)
      const res = await fetch(`/api/alerts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    fetchAlerts()
  }, [fetchAlerts])

  useEffect(() => {
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  const markAsRead = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await fetch(`/api/alerts/${alertId}/read`, { method: "POST" })
  }

  const createAlert = async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, alertBody: newBody, type: newType }),
      })
      if (res.ok) {
        setNewTitle("")
        setNewBody("")
        setNewType("general")
        setCreateOpen(false)
        fetchAlerts()
      }
    } finally {
      setCreating(false)
    }
  }

  const renderAlerts = (filtered: Alert[]) => {
    if (filtered.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No alerts</p>
            <p className="text-sm text-zinc-400 mt-1">No alerts in this category.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {filtered.map((alert) => (
          <Card
            key={alert.id}
            className={`border-l-4 transition-all ${
              alert.type === "emergency" ? "border-l-red-500" : "border-l-amber-500"
            } ${!alert.isRead ? "bg-emerald-50/50" : ""}`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    alert.type === "emergency" ? "text-red-500" : "text-amber-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold">{alert.title}</h3>
                    <Badge variant={alert.type === "emergency" ? "destructive" : "warning"}>
                      {alert.type}
                    </Badge>
                    {!alert.isRead && (
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-zinc-600">{alert.body}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatRelativeTime(alert.createdAt)}
                      <span className="ml-1">by {alert.creator.name}</span>
                    </p>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs gap-1"
                      >
                        <Check className="h-3 w-3" /> Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Community Alerts</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">Title</label>
                <Input
                  placeholder="Alert title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <option value="general">General</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">Body</label>
                <textarea
                  placeholder="Alert details..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 resize-none"
                />
              </div>
              <Button
                onClick={createAlert}
                disabled={creating || !newTitle.trim() || !newBody.trim()}
                className="w-full"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Publish Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-zinc-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-zinc-100 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            renderAlerts(alerts)
          )}
        </TabsContent>
        <TabsContent value="emergency">
          {loading ? null : renderAlerts(alerts.filter((a) => a.type === "emergency"))}
        </TabsContent>
        <TabsContent value="general">
          {loading ? null : renderAlerts(alerts.filter((a) => a.type === "general"))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
