"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Users, Search, MapPin, Phone, Calendar, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const avatarColors = [
  "bg-red-100 text-red-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function formatJoinDate(date: string) {
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(new Date(date))
}

export default function PeoplePage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .not("name", "is", null)
      .neq("name", "")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setProfiles(data)
        setLoading(false)
      })
  }, [supabase])

  const filtered = profiles.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Community Members</h1>
        <p className="text-zinc-500 mt-1">Connect with your neighbours</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-100 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-zinc-100 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-100 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-zinc-100 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-zinc-100 rounded w-1/2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No members found</p>
            <p className="text-sm text-zinc-400 mt-1">
              {searchQuery ? "Try a different search term." : "No community members yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((profile) => (
            <Card key={profile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className={getAvatarColor(profile.name || "U")}>
                      {(profile.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold truncate">{profile.name}</h3>
                      {profile.is_verified && (
                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100 text-emerald-700" title="Verified">
                          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <Badge variant={profile.role === "admin" ? "default" : profile.role === "business" ? "warning" : "secondary"} className="mt-1 capitalize">
                      {profile.role || "resident"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{profile.phone}</span>
                  </div>
                  {profile.zone && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{profile.zone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Joined {formatJoinDate(profile.created_at)}</span>
                  </div>
                </div>

                <Link
                  href={`/messages/new/${profile.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
