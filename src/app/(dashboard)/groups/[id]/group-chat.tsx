"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, ArrowLeft, Paperclip, Users, X, Shield, ChevronRight } from "lucide-react"
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

interface GroupMessage {
  id: string
  text: string | null
  roomId: string
  userId: string
  createdAt: string
  user?: { id: string; name: string; avatarUrl: string | null }
  reactions?: { emoji: string; userId: string }[]
}

export function GroupChat({ group }: { group: any }) {
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userId, setUserId] = useState("")
  const [showInfo, setShowInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })

    fetch(`/api/groups/${group.id}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data)
      })

    const channel = supabase
      .channel(`group:${group.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${group.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any
          supabase
            .from("profiles")
            .select("name, avatarUrl")
            .eq("id", newMsg.user_id)
            .single()
            .then(({ data: profile }) => {
              setMessages((prev) => [
                ...prev,
                {
                  ...newMsg,
                  user: {
                    id: newMsg.user_id,
                    name: profile?.name || "Unknown",
                    avatarUrl: profile?.avatarUrl || null,
                  },
                },
              ])
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [group.id, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    setNewMessage("")

    const res = await fetch(`/api/groups/${group.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newMessage.trim() }),
    })

    const data = await res.json()
    if (!data.error) {
      setMessages((prev) => [...prev, data])
    }
  }

  const currentUserParticipant = group.participants?.find(
    (p: any) => p.userId === userId
  )
  const isCurrentUserAdmin = currentUserParticipant?.isAdmin || false

  return (
    <div className="flex h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-100 bg-white shrink-0">
          <Link
            href="/groups"
            className="lg:hidden h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Link>
          <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${getGroupColor(group.name)}`}>
            <span className="text-sm font-medium">
              {group.name?.charAt(0).toUpperCase() || "G"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{group.name}</h2>
            <p className="text-xs text-zinc-400">
              {group.participants?.length || 0} members
            </p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
              showInfo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Users className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${getGroupColor(group.name)}`}>
                <span className="text-2xl font-bold">
                  {group.name?.charAt(0).toUpperCase() || "G"}
                </span>
              </div>
              <p className="text-zinc-500 font-medium">{group.name}</p>
              <p className="text-sm text-zinc-400 mt-1">
                {group.participants?.length} members · No messages yet
              </p>
              <p className="text-sm text-zinc-400 mt-1">Be the first to say hello!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isOwn = msg.userId === userId
            const sender = msg.user
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                {!isOwn && (
                  <Avatar className="h-8 w-8 mt-1 shrink-0">
                    <AvatarFallback className={`text-xs font-medium ${getGroupColor(sender?.name || "U")}`}>
                      {(sender?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && sender?.name && (
                    <p className="text-xs font-medium text-zinc-500 mb-0.5 ml-1">
                      {sender.name}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm break-words ${
                      isOwn
                        ? "bg-emerald-700 text-white rounded-br-md"
                        : "bg-zinc-100 text-zinc-900 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <p
                    className={`text-[10px] mt-0.5 ${isOwn ? "text-right mr-1" : "ml-1"} text-zinc-400`}
                  >
                    {formatRelativeTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 shrink-0"
            >
              <Paperclip className="h-4 w-4 text-zinc-500" />
            </button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {showInfo && (
        <>
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setShowInfo(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] border-l border-zinc-100 bg-white z-50 overflow-y-auto lg:static lg:z-auto lg:block">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Group Info</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200"
            >
              <X className="h-3.5 w-3.5 text-zinc-600" />
            </button>
          </div>

          <div className="p-4 flex flex-col items-center border-b border-zinc-100">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-3 ${getGroupColor(group.name)}`}>
              <span className="text-3xl font-bold">
                {group.name?.charAt(0).toUpperCase() || "G"}
              </span>
            </div>
            <h3 className="font-semibold text-center">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-zinc-500 text-center mt-1">{group.description}</p>
            )}
            <p className="text-xs text-zinc-400 mt-2">
              {group.participants?.length} members
            </p>
          </div>

          <div className="p-4">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Members
            </h4>
            <div className="space-y-1">
              {group.participants?.map((participant: any) => (
                <div
                  key={participant.userId}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-zinc-50"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={`text-xs font-medium ${getGroupColor(participant.user?.name || "U")}`}>
                      {(participant.user?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">
                        {participant.user?.name || "Unknown"}
                        {participant.userId === userId && (
                          <span className="text-zinc-400 font-normal"> (you)</span>
                        )}
                      </p>
                      {participant.isAdmin && (
                        <Shield className="h-3 w-3 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate">
                      {participant.user?.lastActiveAt &&
                      new Date(participant.user.lastActiveAt).getTime() >
                        Date.now() - 5 * 60 * 1000
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
