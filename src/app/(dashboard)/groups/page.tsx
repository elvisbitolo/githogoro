"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, Search } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

const groupColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
]

function getGroupColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return groupColors[Math.abs(hash) % groupColors.length]
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)
      fetchGroups()

      const channel = supabase
        .channel("group-inbox-updates")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          () => {
            fetchGroups()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups")
      const data = await res.json()
      if (Array.isArray(data)) setGroups(data)
    } catch (e) {
      console.error("Failed to fetch groups:", e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = groups.filter((g) => {
    if (!searchQuery.trim()) return true
    return g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="px-4 h-14 border-b border-zinc-100 bg-white flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold">Groups</h1>
        <Link
          href="/groups/new"
          className="h-9 w-9 rounded-xl bg-emerald-700 flex items-center justify-center hover:bg-emerald-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-white" />
        </Link>
      </div>

      <div className="px-4 py-2 border-b border-zinc-100 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-zinc-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-zinc-200 rounded" />
                  <div className="h-3 w-48 bg-zinc-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Users className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">
              {searchQuery ? "No groups found" : "No groups yet"}
            </p>
            <p className="text-sm text-zinc-400 mt-1 text-center">
              {searchQuery
                ? "Try a different search term"
                : "Create a group to start chatting with multiple people"}
            </p>
            {!searchQuery && (
              <Link
                href="/groups/new"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Group
              </Link>
            )}
          </div>
        ) : (
          filtered.map((group) => {
            const last = group.messages?.[0]
            const memberCount = group.participants?.length || 0

            return (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer border-b border-zinc-50">
                  <div className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={getGroupColor(group.name)}>
                        {group.name?.charAt(0).toUpperCase() || "G"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-zinc-900 truncate">{group.name}</h3>
                      {last && (
                        <span className="text-xs text-zinc-400 shrink-0 ml-2">
                          {formatRelativeTime(last.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm text-zinc-500 truncate">
                        {last
                          ? `${last.user?.name ? last.user.name + ": " : ""}${last.text || "📎 Media"}`
                          : `${memberCount} members`}
                      </p>
                      <span className="text-xs text-zinc-400 shrink-0 ml-2 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {memberCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
