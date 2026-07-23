"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Plus } from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "community", label: "Community" },
  { value: "entertainment", label: "Entertainment" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
]

export default function EventsPageClient() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [initialized, setInitialized] = useState(false)

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events")
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) setEvents(data)
    }
    setLoading(false)
    setInitialized(true)
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  if (!initialized && !loading) return null

  const filtered = categoryFilter === "all" ? events : events.filter((e) => e.category === categoryFilter)
  const now = new Date()
  const upcoming = filtered.filter((e) => new Date(e.date) >= now)

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 mt-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categoryFilter === cat.value ? "bg-emerald-700 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse"><div className="h-40 bg-zinc-100 rounded-xl" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No events found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcoming.map((event: any) => {
            const date = new Date(event.date)
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center justify-center h-10 w-12 rounded-lg bg-emerald-50 text-emerald-700 flex-col leading-none">
                            <span className="text-xs font-bold uppercase">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                            <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base truncate">{event.title}</h3>
                            <p className="text-xs text-zinc-500">{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {event.rsvpCounts?.going || 0} going</span>
                        </div>
                      </div>
                      <Badge variant="default">Upcoming</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
