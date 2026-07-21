"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatRelativeTime, formatDate } from "@/lib/utils"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"

interface Meeting {
  id: string
  title: string
  content: string
  meetingDate: string
  attendees: number | null
  createdAt: string
  user: { id: string; name: string }
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/governance/meetings")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Meeting Minutes</h1>
          <p className="text-sm text-zinc-500 mt-1">Community meeting records</p>
        </div>
        <Link href="/governance/meetings/new">
          <button className="inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-800 transition-colors">
            Post Minutes
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-12">No meeting minutes yet</p>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="font-semibold text-zinc-900 mb-2">{meeting.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-3 mb-3">{meeting.content}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(meeting.meetingDate)}
                  </span>
                  {meeting.attendees && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {meeting.attendees} attendees
                    </span>
                  )}
                  <span>Posted by {meeting.user.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
