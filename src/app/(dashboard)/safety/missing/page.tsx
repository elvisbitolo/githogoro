"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Plus, MapPin, Phone, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface MissingPerson {
  id: string
  name: string
  description: string | null
  category: string
  photo: string | null
  location: string | null
  contactPhone: string
  status: string
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

export default function MissingPage() {
  const [alerts, setAlerts] = useState<MissingPerson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/safety/missing")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAlerts(data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Missing Person Alerts
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Help bring them home safely</p>
        </div>
        <Link href="/safety/missing/new">
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4" /> Report
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-32" /></Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No active missing person alerts</p>
            <p className="text-sm text-zinc-400 mt-1">That is good news. Stay vigilant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {alert.photo && (
                    <img src={alert.photo} alt={alert.name} className="h-16 w-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{alert.name}</h3>
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">{alert.category}</Badge>
                      <Badge className="bg-red-100 text-red-700 text-[10px]">{alert.status}</Badge>
                    </div>
                    {alert.description && <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{alert.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(alert.createdAt)}</span>
                      {alert.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.location}</span>}
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{alert.contactPhone}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Posted by {alert.user.name}</p>
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
