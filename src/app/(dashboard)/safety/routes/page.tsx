"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Route, Star, Plus, MapPin, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface SafeRoute {
  id: string
  from: string
  to: string
  rating: number
  timeOfDay: string
  comment: string | null
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

export default function SafeRoutesPage() {
  const [routes, setRoutes] = useState<SafeRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ from: "", to: "", rating: "5", timeOfDay: "morning", comment: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/safety/routes")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRoutes(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.from || !form.to) return
    setSaving(true)
    try {
      const res = await fetch("/api/safety/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const newRoute = await res.json()
        setRoutes((prev) => [newRoute, ...prev])
        setForm({ from: "", to: "", rating: "5", timeOfDay: "morning", comment: "" })
        setShowForm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Route className="h-6 w-6 text-emerald-600" />
            Safe Routes
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Discover and share safe walking routes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add Route
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">From *</label>
                <Input placeholder="Starting point" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">To *</label>
                <Input placeholder="Destination" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">Safety Rating (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setForm({ ...form, rating: String(r) })}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${r <= Number(form.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">Time of Day</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  value={form.timeOfDay}
                  onChange={(e) => setForm({ ...form, timeOfDay: e.target.value })}
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Comment</label>
              <Input placeholder="Any safety notes about this route?" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? "Adding..." : "Add Route"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-24" /></Card>
          ))}
        </div>
      ) : routes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Route className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No safe routes shared yet</p>
            <p className="text-sm text-zinc-400 mt-1">Share a route you consider safe for the community</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-500" />
                        {route.from} → {route.to}
                      </h3>
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{route.timeOfDay}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= route.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                      ))}
                    </div>
                    {route.comment && <p className="text-xs text-zinc-500 mt-1">{route.comment}</p>}
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {route.user.name} &middot; {formatRelativeTime(route.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
