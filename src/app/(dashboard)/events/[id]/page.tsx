"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar, MapPin, Users, ArrowLeft, Share2, ExternalLink,
  CheckCircle, HelpCircle, XCircle, Trash2, Edit, Ticket
} from "lucide-react"
import Link from "next/link"

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

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRsvp, setUserRsvp] = useState<string | null>(null)
  const [rsvpCounts, setRsvpCounts] = useState({ going: 0, maybe: 0, notGoing: 0 })
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${id}`)
    if (res.ok) {
      const data = await res.json()
      if (!data.error) {
        setEvent(data)
        setRsvpCounts(data.rsvpCounts || { going: 0, maybe: 0, notGoing: 0 })
      }
    }
    setLoading(false)
  }, [id])

  useEffect(() => { fetchEvent() }, [fetchEvent])

  useEffect(() => {
    if (userId && id) {
      fetch(`/api/events/${id}/rsvp`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setUserRsvp(data.userRsvp)
            setRsvpCounts(data.rsvpCounts)
          }
        })
    }
  }, [userId, id])

  const handleRsvp = async (status: string) => {
    if (!userId || rsvpLoading) return
    setRsvpLoading(true)
    try {
      const res = await fetch(`/api/events/${id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setUserRsvp(data.userRsvp)
        setRsvpCounts(data.rsvpCounts)
      }
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (res.ok) router.push("/events")
    } finally {
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: event?.title, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <p className="text-zinc-500">Event not found</p>
      </div>
    )
  }

  const date = new Date(event.date)
  const isUpcoming = date >= new Date()
  const isCreator = userId === event.createdBy
  const goingAttendees = event.attendees?.filter((a: any) => a.status === "going") || []
  const maybeAttendees = event.attendees?.filter((a: any) => a.status === "maybe") || []
  const notGoingAttendees = event.attendees?.filter((a: any) => a.status === "not_going") || []

  return (
    <div className="min-h-[calc(100dvh-4rem)] lg:min-h-dvh bg-white">
      {event.coverPhoto ? (
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img
            src={event.coverPhoto}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className={`relative h-56 sm:h-72 bg-gradient-to-br ${getGradient(event.id)} flex items-center justify-center`}>
          <Calendar className="h-20 w-20 text-white/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-2">
            <Link
              href="/events"
              className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-zinc-700" />
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <Share2 className="h-5 w-5 text-zinc-700" />
            </button>
            {isCreator && (
              <Link
                href={`/events/${event.id}/edit`}
                className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
              >
                <Edit className="h-5 w-5 text-zinc-700" />
              </Link>
            )}
          </div>
        </div>

        <Badge className="mb-2">{event.category}</Badge>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{event.title}</h1>

        <div className="flex items-center gap-2 mb-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.creator?.avatarUrl || undefined} />
            <AvatarFallback className="text-xs bg-zinc-100 text-zinc-600">
              {event.creator?.name?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-zinc-500">
            Created by {event.creator?.name || "Unknown"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-zinc-500">
                {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{event.location}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1"
              >
                View on map <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {!event.isFree && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 mb-6">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium">Ksh {event.ticketPrice}</p>
              <p className="text-xs text-zinc-500">Ticket price</p>
            </div>
          </div>
        )}

        {event.maxAttendees && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {rsvpCounts.going} / {event.maxAttendees}
              </p>
              <p className="text-xs text-zinc-500">Attendees</p>
            </div>
          </div>
        )}

        {event.description && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              About
            </h2>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        {userId && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Your RSVP
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={userRsvp === "going" ? "default" : "outline"}
                onClick={() => handleRsvp("going")}
                disabled={rsvpLoading}
                className={`${userRsvp === "going" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
              >
                <CheckCircle className="h-4 w-4 mr-1 hidden sm:inline" />
                <span className="text-xs sm:text-sm">Going</span>
                {rsvpCounts.going > 0 && (
                  <span className="ml-1 text-xs opacity-75">({rsvpCounts.going})</span>
                )}
              </Button>
              <Button
                variant={userRsvp === "maybe" ? "default" : "outline"}
                onClick={() => handleRsvp("maybe")}
                disabled={rsvpLoading}
                className={`${userRsvp === "maybe" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
              >
                <HelpCircle className="h-4 w-4 mr-1 hidden sm:inline" />
                <span className="text-xs sm:text-sm">Maybe</span>
                {rsvpCounts.maybe > 0 && (
                  <span className="ml-1 text-xs opacity-75">({rsvpCounts.maybe})</span>
                )}
              </Button>
              <Button
                variant={userRsvp === "not_going" ? "default" : "outline"}
                onClick={() => handleRsvp("not_going")}
                disabled={rsvpLoading}
                className={`${userRsvp === "not_going" ? "bg-zinc-700 hover:bg-zinc-800 text-white" : ""}`}
              >
                <XCircle className="h-4 w-4 mr-1 hidden sm:inline" />
                <span className="text-xs sm:text-sm">Can&apos;t Go</span>
                {rsvpCounts.notGoing > 0 && (
                  <span className="ml-1 text-xs opacity-75">({rsvpCounts.notGoing})</span>
                )}
              </Button>
            </div>
          </div>
        )}

        {goingAttendees.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Going ({goingAttendees.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {goingAttendees.map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={a.avatarUrl || undefined} />
                    <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">
                      {a.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-emerald-700">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {maybeAttendees.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Maybe ({maybeAttendees.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {maybeAttendees.map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={a.avatarUrl || undefined} />
                    <AvatarFallback className="text-[10px] bg-amber-100 text-amber-700">
                      {a.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-amber-700">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {notGoingAttendees.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Can&apos;t Go ({notGoingAttendees.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {notGoingAttendees.map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={a.avatarUrl || undefined} />
                    <AvatarFallback className="text-[10px] bg-zinc-200 text-zinc-600">
                      {a.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-zinc-600">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isCreator && (
          <div className="pb-8">
            <div className="border-t border-zinc-100 pt-6">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {deleting ? "Deleting..." : "Delete Event"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
