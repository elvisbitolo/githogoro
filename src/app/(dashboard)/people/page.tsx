"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Search, MapPin, Phone, Calendar, MessageCircle, Briefcase, Shield, Star, Filter } from "lucide-react"
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

const zoneFilters = [
  "All Zones",
  "Matopeni",
  "72 Estate",
  "Blue Estate",
  "Green Estate",
  "Mji wa Huruma",
  "Shantii",
  "Runda Meadows",
  "Muringa Farm",
  "Githogoro Zone 1",
  "Githogoro Zone 2",
  "Githogoro Zone 3",
  "Githogoro Zone 4",
  "Githogoro Zone 5",
  "Githogoro Stage",
  "Northern Bypass",
  "Kiwaru",
]

const roleFilters = ["All", "Resident", "Business", "Admin"]

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

function timeSince(date: string | null) {
  if (!date) return null
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatJoinDate(date)
}

export default function PeoplePage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [zoneFilter, setZoneFilter] = useState("All Zones")
  const [roleFilter, setRoleFilter] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setProfiles(data)
        setLoading(false)
      })
  }, [])

  const filtered = profiles.filter((p) => {
    if (!p.name) return false
    const matchesSearch = !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesZone = zoneFilter === "All Zones" || p.zone === zoneFilter
    const matchesRole = roleFilter === "All" ||
      (roleFilter === "Resident" && (!p.role || p.role === "resident")) ||
      p.role?.toLowerCase() === roleFilter.toLowerCase()
    return matchesSearch && matchesZone && matchesRole
  })

  const onlineCount = profiles.filter(p => {
    if (!p.lastSeen) return false
    return (Date.now() - new Date(p.lastSeen).getTime()) < 15 * 60 * 1000
  }).length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Community Members</h1>
        <p className="text-zinc-500 mt-1">
          Connect with your neighbours
          {onlineCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCount} online
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            showFilters || zoneFilter !== "All Zones" || roleFilter !== "All"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {(zoneFilter !== "All Zones" || roleFilter !== "All") && (
            <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
              {(zoneFilter !== "All Zones" ? 1 : 0) + (roleFilter !== "All" ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 block">Zone</label>
              <div className="flex flex-wrap gap-2">
                {zoneFilters.map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoneFilter(z)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      zoneFilter === z
                        ? "bg-emerald-700 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 block">Role</label>
              <div className="flex flex-wrap gap-2">
                {roleFilters.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      roleFilter === r
                        ? "bg-emerald-700 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-100 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-100 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-zinc-100 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-100 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-zinc-100 rounded w-2/3 animate-pulse" />
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
              {searchQuery || zoneFilter !== "All Zones" || roleFilter !== "All"
                ? "Try adjusting your search or filters."
                : "No community members yet."}
            </p>
            {(searchQuery || zoneFilter !== "All Zones" || roleFilter !== "All") && (
              <button
                onClick={() => { setSearchQuery(""); setZoneFilter("All Zones"); setRoleFilter("All") }}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((profile) => {
            const isOnline = profile.lastSeen &&
              (Date.now() - new Date(profile.lastSeen).getTime()) < 15 * 60 * 1000
            return (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={profile.avatarUrl} />
                        <AvatarFallback className={getAvatarColor(profile.name || "U")}>
                          {(profile.name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-semibold truncate">{profile.name}</h3>
                        {profile.isVerified && (
                          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100 text-emerald-700" title="Verified">
                            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {profile.role === "admin" && (
                          <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                            <Shield className="h-2.5 w-2.5 mr-0.5" /> Admin
                          </Badge>
                        )}
                        {profile.role === "business" && (
                          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                            <Briefcase className="h-2.5 w-2.5 mr-0.5" /> Business
                          </Badge>
                        )}
                        {(!profile.role || profile.role === "resident") && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Resident</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{profile.bio}</p>
                  )}

                  <div className="space-y-1.5 text-sm text-zinc-500 mb-4">
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{profile.phone}</span>
                      </div>
                    )}
                    {profile.zone && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{profile.zone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Joined {formatJoinDate(profile.createdAt)}</span>
                    </div>
                    {profile.lastSeen && !isOnline && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <span className="h-3.5 w-3.5 shrink-0 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                        </span>
                        <span className="text-xs">Active {timeSince(profile.lastSeen)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/chat/new"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Link>
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-center text-sm text-zinc-400 mt-6">
          Showing {filtered.length} of {profiles.length} members
        </p>
      )}
    </div>
  )
}
