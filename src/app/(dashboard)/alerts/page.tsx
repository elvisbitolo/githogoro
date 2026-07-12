"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bell, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.from("alerts").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setAlerts(data)
      setLoading(false)
    })
  }, [supabase])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Community Alerts</h1>

      <div className="space-y-3">
        {(!alerts || alerts.length === 0) ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No alerts</p>
              <p className="text-sm text-zinc-400 mt-1">Emergency alerts will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${alert.type === "emergency" ? "border-l-red-500" : "border-l-amber-500"}`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.type === "emergency" ? "text-red-500" : "text-amber-500"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <Badge variant={alert.type === "emergency" ? "destructive" : "warning"}>
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-600">{alert.body}</p>
                    <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatRelativeTime(alert.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
