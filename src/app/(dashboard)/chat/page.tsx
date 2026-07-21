"use client"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Plus, Search, Pin, Bell, BellOff, Archive, MoreVertical } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "groups">("all")
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)
      fetchConversations()

      // Subscribe to new private messages for real-time inbox updates
      const channel = supabase
        .channel("inbox-updates")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "private_messages" },
          () => {
            fetchConversations()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations")
      const data = await res.json()
      if (Array.isArray(data)) {
        // Sort by last message time (most recent first)
        const sorted = data.sort((a: any, b: any) => {
          const aTime = a.messages?.[0]?.createdAt || a.createdAt
          const bTime = b.messages?.[0]?.createdAt || b.createdAt
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })
        setConversations(sorted)
      }
    } catch (e) {
      console.error("Failed to fetch conversations:", e)
    } finally {
      setLoading(false)
    }
  }

  const getOtherParticipant = (conv: any) =>
    conv.participants?.find((p: any) => p.userId !== userId)?.user

  const getLastMessage = (conv: any) => {
    const msgs = conv.messages || []
    return msgs[msgs.length - 1]
  }

  const getUnreadCount = (conv: any) => {
    const participant = conv.participants?.find((p: any) => p.userId === userId)
    if (!participant?.lastReadAt) return 0
    const lastRead = new Date(participant.lastReadAt)
    const lastMsg = conv.messages?.[0]
    if (!lastMsg) return 0
    if (new Date(lastMsg.createdAt) > lastRead && lastMsg.senderId !== userId) return 1
    return 0
  }

  const filtered = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const other = getOtherParticipant(conv)
    return other?.name?.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-dvh">
      {/* Header */}
      <div className="px-4 h-14 border-b border-zinc-100 bg-white flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold">Messages</h1>
        <Link
          href="/chat/new"
          className="h-9 w-9 rounded-xl bg-emerald-700 flex items-center justify-center hover:bg-emerald-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-white" />
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-zinc-100 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 bg-white shrink-0">
        {(["all", "unread", "groups"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-emerald-700 border-b-2 border-emerald-700"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conversation List */}
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
            <MessageSquare className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </p>
            <p className="text-sm text-zinc-400 mt-1 text-center">
              {searchQuery
                ? "Try a different search term"
                : "Start a conversation with someone in your community"}
            </p>
            {!searchQuery && (
              <Link
                href="/people"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Find People
              </Link>
            )}
          </div>
        ) : (
          filtered.map((conv) => {
            const other = getOtherParticipant(conv)
            const last = getLastMessage(conv)
            const unread = getUnreadCount(conv)
            const isPinned = conv.pinnedBy?.some((p: any) => p.userId === userId)
            const isMuted = conv.participants?.find((p: any) => p.userId === userId)?.isMuted

            return (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer border-b border-zinc-50">
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={other?.avatarUrl} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {(other?.name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    {other?.lastActiveAt && new Date(other.lastActiveAt).getTime() > Date.now() - 5 * 60 * 1000 && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isPinned && <Pin className="h-3 w-3 text-zinc-400 shrink-0" />}
                        <h3 className={`font-medium truncate ${unread > 0 ? "text-zinc-900" : "text-zinc-700"}`}>
                          {other?.name || "Unknown"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isMuted && <BellOff className="h-3 w-3 text-zinc-400" />}
                        {last && (
                          <span className={`text-xs ${unread > 0 ? "text-emerald-600 font-medium" : "text-zinc-400"}`}>
                            {formatRelativeTime(last.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-sm truncate ${unread > 0 ? "text-zinc-800 font-medium" : "text-zinc-500"}`}>
                        {last
                          ? `${last.senderId === userId ? "You: " : ""}${last.text || "📎 Media"}`
                          : "No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 h-5 min-w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center px-1.5 shrink-0">
                          {unread}
                        </span>
                      )}
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
