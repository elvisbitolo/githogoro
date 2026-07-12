"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.from("events").select("*").order("date", { ascending: true }).then(({ data }) => {
      if (data) setEvents(data)
      setLoading(false)
    })
  }, [supabase])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Community Events</h1>

      <div className="space-y-3">
        {(!events || events.length === 0) ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No events scheduled</p>
              <p className="text-sm text-zinc-400 mt-1">Events will appear here once posted.</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{event.category}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {event.location}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-zinc-600 mt-2">{event.description}</p>
                    )}
                  </div>
                  <Badge variant={new Date(event.date) > new Date() ? "default" : "secondary"}>
                    {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
