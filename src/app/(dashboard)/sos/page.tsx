"use client"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertTriangle, MapPin, Clock, CheckCircle, MessageSquare } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { SOSButton } from "./sos-button"

interface SOSUser {
  id: string
  name: string
  avatarUrl: string | null
  zone?: string | null
}

interface SOSResponse {
  id: string
  message: string | null
  createdAt: string
  user: SOSUser
}

interface SOSAlert {
  id: string
  latitude: number | null
  longitude: number | null
  message: string | null
  status: string
  createdAt: string
  user: SOSUser
  responses: SOSResponse[]
}

export default function SOSPage() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState("")

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/sos")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setAlerts(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  const handleSOS = async (message: string) => {
    setSending(true)
    try {
      let latitude: number | null = null
      let longitude: number | null = null

      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            })
          })
          latitude = pos.coords.latitude
          longitude = pos.coords.longitude
        } catch {
          // Location unavailable, proceed without it
        }
      }

      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, message: message || null }),
      })

      if (res.ok) {
        const newAlert = await res.json()
        setAlerts((prev) => [newAlert, ...prev])
      }
    } finally {
      setSending(false)
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      const res = await fetch(`/api/sos/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      })
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: "resolved" } : a))
        )
      }
    } catch {}
  }

  const handleRespond = async (alertId: string) => {
    if (!responseMessage.trim()) return
    try {
      const res = await fetch(`/api/sos/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: responseMessage.trim() }),
      })
      if (res.ok) {
        const newResponse = await res.json()
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, responses: [...a.responses, newResponse] }
              : a
          )
        )
        setResponseMessage("")
        setRespondingTo(null)
      }
    } catch {}
  }

  const activeAlerts = alerts.filter((a) => a.status === "active")
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved")

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Emergency SOS</h1>
        <p className="text-zinc-500 text-sm">
          Press the button below to send an emergency alert to the community
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <SOSButton onTrigger={handleSOS} loading={sending} />
      </div>

      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            Active Alerts ({activeAlerts.length})
          </h2>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <Card key={alert.id} className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-red-100 text-red-700">
                        {alert.user.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{alert.user.name}</h3>
                        <Badge variant="destructive" className="text-[10px]">
                          {alert.status}
                        </Badge>
                        {alert.user.zone && (
                          <Badge variant="secondary" className="text-[10px]">
                            {alert.user.zone}
                          </Badge>
                        )}
                      </div>
                      {alert.message && (
                        <p className="text-sm text-zinc-700 mt-1">{alert.message}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(alert.createdAt)}
                        </span>
                        {alert.latitude && alert.longitude && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location shared
                          </span>
                        )}
                      </div>

                      {alert.responses.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {alert.responses.map((resp) => (
                            <div
                              key={resp.id}
                              className="bg-white rounded-lg p-2 border border-zinc-100"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-700">
                                  {resp.user.name}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {formatRelativeTime(resp.createdAt)}
                                </span>
                              </div>
                              {resp.message && (
                                <p className="text-xs text-zinc-600 mt-0.5">{resp.message}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        {respondingTo === alert.id ? (
                          <div className="flex gap-2 flex-1">
                            <input
                              type="text"
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              placeholder="Type a response..."
                              className="flex-1 h-8 rounded-lg border border-zinc-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRespond(alert.id)
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleRespond(alert.id)}
                              className="h-8 text-xs"
                            >
                              Send
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setRespondingTo(null)
                                setResponseMessage("")
                              }}
                              className="h-8 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRespondingTo(alert.id)}
                              className="h-10 text-xs gap-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              Respond
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleResolve(alert.id)}
                              className="h-10 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Mark Resolved
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Resolved ({resolvedAlerts.length})
          </h2>
          <div className="space-y-3 opacity-60">
            {resolvedAlerts.slice(0, 10).map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {alert.user.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{alert.user.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          resolved
                        </Badge>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No emergency alerts</p>
            <p className="text-sm text-zinc-400 mt-1">
              Stay safe. SOS alerts will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
