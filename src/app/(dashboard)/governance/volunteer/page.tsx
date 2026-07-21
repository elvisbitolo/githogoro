"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { MapPin, Calendar, Users as UsersIcon } from "lucide-react"

interface Opportunity {
  id: string
  title: string
  description: string | null
  date: string | null
  location: string | null
  maxVolunteers: number | null
  createdAt: string
  creator: { id: string; name: string }
  _count: { signups: number }
}

export default function VolunteerPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [signingUp, setSigningUp] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    fetch("/api/governance/volunteer")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOpportunities(Array.isArray(data) ? data : []))
      .catch(() => setOpportunities([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSignup = async (id: string) => {
    setSigningUp(id)
    try {
      const res = await fetch(`/api/governance/volunteer/${id}/signup`, {
        method: "POST",
      })
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, _count: { signups: o._count.signups + 1 } } : o
          )
        )
      }
    } finally {
      setSigningUp(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Volunteer Board</h1>
          <p className="text-sm text-zinc-500 mt-1">Make a difference in your community</p>
        </div>
        <Link href="/governance/volunteer/new">
          <Button size="sm">Create Opportunity</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-12">No volunteer opportunities yet</p>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const isFull = opp.maxVolunteers && opp._count.signups >= opp.maxVolunteers

            return (
              <Card key={opp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-zinc-900">{opp.title}</h3>
                    {isFull && <Badge variant="secondary">Full</Badge>}
                  </div>
                  {opp.description && (
                    <p className="text-sm text-zinc-500 mb-3">{opp.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-3">
                    {opp.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatRelativeTime(opp.date)}
                      </span>
                    )}
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {opp.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      {opp._count.signups}
                      {opp.maxVolunteers ? ` / ${opp.maxVolunteers}` : ""} volunteers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">By {opp.creator.name}</span>
                    {!isFull && userId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSignup(opp.id)}
                        disabled={signingUp === opp.id}
                      >
                        {signingUp === opp.id ? "Signing up..." : "Sign Up"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
