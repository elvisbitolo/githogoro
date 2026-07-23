import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import EventsPageClient from "./page-client"

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

export default async function EventsPage() {
  let events: any[] = []
  try {
    const now = new Date()
    events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      take: 20,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        rsvps: { select: { status: true } },
      },
    })
    events = events.map((e) => ({
      ...e,
      rsvpCounts: {
        going: e.rsvps.filter((r: any) => r.status === "going").length,
        maybe: e.rsvps.filter((r: any) => r.status === "maybe").length,
        notGoing: e.rsvps.filter((r: any) => r.status === "not_going").length,
      },
    }))
  } catch {
    // DB not available
  }

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.date) >= now)
  const past = events.filter((e) => new Date(e.date) < now)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/events/new">
          <span className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
            + Create Event
          </span>
        </Link>
      </div>

      <p className="text-zinc-500 mb-4">
        Find and RSVP to events in Githogoro, Nairobi. Community gatherings, meetings, sports, and social events near Runda and Northern Bypass.
      </p>

      {events.length > 0 ? (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
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
                              {event.description && <p className="text-sm text-zinc-600 mt-2 line-clamp-2">{event.description}</p>}
                            </div>
                            <Badge variant="default">Upcoming</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Past ({past.length})</h2>
              <div className="space-y-3 opacity-75">
                {past.map((event: any) => {
                  const date = new Date(event.date)
                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card className="hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{event.title}</h3>
                              <p className="text-xs text-zinc-500">{date.toLocaleDateString()}</p>
                            </div>
                            <Badge variant="secondary">Past</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No events yet</p>
            <p className="text-sm text-zinc-400 mt-1">Create the first event for your community!</p>
          </CardContent>
        </Card>
      )}

      <EventsPageClient />
    </div>
  )
}
