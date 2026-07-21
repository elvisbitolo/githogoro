"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Clock, Users, Car } from "lucide-react"
import { formatRelativeTime, formatDate } from "@/lib/utils"

interface Ride {
  id: string
  from: string
  to: string
  departureTime: string
  seats: number
  price: number | null
  status: string
  description: string | null
  createdAt: string
  driver: { id: string; name: string; avatarUrl: string | null; zone: string | null }
  rider: { id: string; name: string; avatarUrl: string | null } | null
}

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)

  const fetchRides = useCallback(async () => {
    try {
      const res = await fetch("/api/rides")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setRides(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRides() }, [fetchRides])

  const handleJoin = async (id: string) => {
    setJoining(id)
    try {
      const res = await fetch(`/api/rides/${id}/join`, { method: "POST" })
      if (res.ok) {
        const updated = await res.json()
        setRides((prev) => prev.map((r) => (r.id === id ? updated : r)))
      }
    } finally {
      setJoining(null)
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    scheduled: "bg-emerald-100 text-emerald-700",
    full: "bg-amber-100 text-amber-700",
    completed: "bg-zinc-200 text-zinc-600",
    cancelled: "bg-red-100 text-red-600",
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ride Shares</h1>
          <p className="text-zinc-500 text-sm mt-1">Share rides and save on transport</p>
        </div>
        <Link href="/rides/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Offer Ride
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-28" /></Card>
          ))}
        </div>
      ) : rides.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No rides available</p>
            <p className="text-sm text-zinc-400 mt-1">Offer a ride or check back later</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <Card key={ride.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{ride.from} → {ride.to}</h3>
                      <Badge className={`${STATUS_COLORS[ride.status] || "bg-zinc-100 text-zinc-600"} text-[10px]`}>{ride.status}</Badge>
                    </div>
                    {ride.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{ride.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(ride.departureTime)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ride.seats} seat{ride.seats !== 1 ? "s" : ""}</span>
                      {ride.price !== null && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">KES {ride.price}</Badge>}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Driven by {ride.driver.name}</p>
                    {ride.rider && (
                      <p className="text-xs text-blue-500 mt-1">Rider: {ride.rider.name}</p>
                    )}
                  </div>
                  {ride.status === "scheduled" && ride.seats > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleJoin(ride.id)}
                      disabled={joining === ride.id}
                      className="shrink-0 gap-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {joining === ride.id ? "..." : "Join"}
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
