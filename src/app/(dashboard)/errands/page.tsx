"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Clock, DollarSign, CheckCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Errand {
  id: string
  title: string
  description: string | null
  pickupLocation: string
  dropoffLocation: string | null
  tip: number | null
  status: string
  dueDate: string | null
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null; zone: string | null }
  accepter: { id: string; name: string; avatarUrl: string | null } | null
}

export default function ErrandsPage() {
  const [errands, setErrands] = useState<Errand[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  const fetchErrands = useCallback(async () => {
    try {
      const res = await fetch("/api/errands")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setErrands(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchErrands() }, [fetchErrands])

  const handleAccept = async (id: string) => {
    setAccepting(id)
    try {
      const res = await fetch(`/api/errands/${id}/accept`, { method: "POST" })
      if (res.ok) {
        const updated = await res.json()
        setErrands((prev) => prev.map((e) => (e.id === id ? updated : e)))
      }
    } finally {
      setAccepting(null)
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-700",
    accepted: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-zinc-200 text-zinc-600",
    cancelled: "bg-red-100 text-red-600",
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Errands</h1>
          <p className="text-zinc-500 text-sm mt-1">Request or run errands for your neighbors</p>
        </div>
        <Link href="/errands/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Post Errand
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-28" /></Card>
          ))}
        </div>
      ) : errands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No errands posted yet</p>
            <p className="text-sm text-zinc-400 mt-1">Post an errand or offer to help a neighbor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {errands.map((errand) => (
            <Card key={errand.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{errand.title}</h3>
                      <Badge className={`${STATUS_COLORS[errand.status] || "bg-zinc-100 text-zinc-600"} text-[10px]`}>{errand.status}</Badge>
                      {errand.tip && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1">
                          <DollarSign className="h-3 w-3" />{errand.tip} tip
                        </Badge>
                      )}
                    </div>
                    {errand.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{errand.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{errand.pickupLocation}</span>
                      {errand.dropoffLocation && <span className="flex items-center gap-1">→ {errand.dropoffLocation}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(errand.createdAt)}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Posted by {errand.creator.name}</p>
                    {errand.accepter && (
                      <p className="text-xs text-blue-500 mt-1">Accepted by {errand.accepter.name}</p>
                    )}
                  </div>
                  {errand.status === "open" && (
                    <Button
                      size="sm"
                      onClick={() => handleAccept(errand.id)}
                      disabled={accepting === errand.id}
                      className="shrink-0 gap-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-3 w-3" />
                      {accepting === errand.id ? "..." : "Accept"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
