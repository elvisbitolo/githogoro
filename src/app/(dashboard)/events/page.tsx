"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Plus, CheckCircle, HelpCircle, XCircle } from "lucide-react"
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

const GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-blue-500",
]

function getGradient(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events")
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) setEvents(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleRsvp = async (eventId: string, status: string) => {
    if (!userId || rsvpLoading) return
    setRsvpLoading(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, rsvpCounts: data.rsvpCounts, userRsvp: data.userRsvp }
              : e
          )
        )
      }
    } finally {
      setRsvpLoading(null)
    }
  }

  const filtered = categoryFilter === "all"
    ? events
    : events.filter((e) => e.category === categoryFilter)

  const now = new Date()
  const upcoming = filtered.filter((e) => new Date(e.date) >= now)
  const past = filtered.filter((e) => new Date(e.date) < now)

  const renderEvent = (event: any) => {
    const date = new Date(event.date)
    const isUpcoming = date >= now
    const userRsvp = event.userRsvp || null

    return (
      <Link key={event.id} href={`/events/${event.id}`}>
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          {event.coverPhoto ? (
            <div className="relative h-40 sm:h-48 overflow-hidden">
              <img
                src={event.coverPhoto}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-white/90 text-zinc-800 backdrop-blur-sm">
                  {event.category}
                </Badge>
                {!event.isFree && (
                  <Badge className="bg-amber-100 text-amber-800 backdrop-blur-sm">
                    Ksh {event.ticketPrice}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className={`relative h-32 sm:h-40 bg-gradient-to-br ${getGradient(event.id)} flex items-center justify-center`}>
              <Calendar className="h-12 w-12 text-white/60" />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-white/90 text-zinc-800 backdrop-blur-sm">
                  {event.category}
                </Badge>
                {!event.isFree && (
                  <Badge className="bg-amber-100 text-amber-800 backdrop-blur-sm">
                    Ksh {event.ticketPrice}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center h-10 w-12 rounded-lg bg-emerald-50 text-emerald-700 flex-col leading-none">
                    <span className="text-xs font-bold uppercase">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">{event.title}</h3>
                    <p className="text-xs text-zinc-500">
                      {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {event.rsvpCounts?.going || 0} going
                  </span>
                </div>

                {event.description && (
                  <p className="text-sm text-zinc-600 mt-2 line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-zinc-100 text-zinc-600">
                      {event.creator?.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-zinc-400">
                    by {event.creator?.name || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge variant={isUpcoming ? "default" : "secondary"}>
                  {isUpcoming ? "Upcoming" : "Past"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/events/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Event
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categoryFilter === cat.value
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-zinc-100 rounded-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-zinc-100 rounded w-1/2" />
                <div className="h-3 bg-zinc-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No events found</p>
            <p className="text-sm text-zinc-400 mt-1">
              {categoryFilter === "all"
                ? "Create the first event for your community!"
                : `No ${categoryFilter} events yet.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">{upcoming.map(renderEvent)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Past ({past.length})
              </h2>
              <div className="space-y-3 opacity-75">{past.map(renderEvent)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
