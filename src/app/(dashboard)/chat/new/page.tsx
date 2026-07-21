"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, MessageCircle, Users } from "lucide-react"
import Link from "next/link"

export default function NewChatPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profiles, setProfiles] = useState<any[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [creating, setCreating] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setLoading(false)
        return
      }
      setMyId(user.id)

      const res = await fetch("/api/profiles")
      if (cancelled) return
      const data = res.ok ? await res.json() : []
      if (Array.isArray(data)) {
        setProfiles(data.filter((p: any) => p.id !== user.id))
      }
      setLoading(false)
    }

    init()
    return () => { cancelled = true }
  }, [])

  const filtered = profiles.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return p.name?.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q)
  })

  const startConversation = async (targetUserId: string) => {
    setCreating(targetUserId)
    try {
      const res = await fetch("/api/conversations/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      })
      const conv = await res.json()
      if (res.ok && conv.id) {
        router.push(`/chat/${conv.id}`)
      }
    } catch (e) {
      console.error("Failed to create conversation:", e)
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-dvh">
      {/* Header */}
      <div className="px-4 h-14 border-b border-zinc-100 bg-white flex items-center gap-3 shrink-0">
        <Link href="/chat" className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="h-4 w-4 text-zinc-600" />
        </Link>
        <h1 className="text-lg font-semibold">New Message</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-zinc-100 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* People List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-zinc-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-zinc-200 rounded" />
                  <div className="h-3 w-24 bg-zinc-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Users className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">
              {searchQuery ? "No people found" : "No community members yet"}
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              {searchQuery ? "Try a different search term" : ""}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {filtered.map((profile) => (
              <button
                key={profile.id}
                onClick={() => startConversation(profile.id)}
                disabled={creating !== null}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left disabled:opacity-50"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {(profile.name || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium truncate">{profile.name}</h3>
                    {profile.isVerified && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100">
                        <svg className="h-2.5 w-2.5 text-emerald-700" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 truncate">
                    {profile.phone}
                    {profile.zone ? ` · ${profile.zone}` : ""}
                  </p>
                </div>
                <div className="shrink-0">
                  {creating === profile.id ? (
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
