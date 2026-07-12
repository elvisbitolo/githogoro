"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, ArrowLeft, Paperclip } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import type { ChatRoom, Message } from "@/types"

export function ChatRoom({ room }: { room: ChatRoom }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userId, setUserId] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })

    // Load existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data)
      })

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room.id, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const { error } = await supabase.from("messages").insert({
      room_id: room.id,
      user_id: userId,
      text: newMessage.trim(),
    })

    if (!error) setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-100 bg-white">
        <Link href="/chat" className="lg:hidden">
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>
        <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
          <span className="text-sm font-medium text-emerald-700">
            {room.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="font-semibold text-sm">{room.name}</h2>
          <p className="text-xs text-zinc-400 capitalize">{room.type}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.user_id === userId ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                U
              </AvatarFallback>
            </Avatar>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                msg.user_id === userId
                  ? "bg-emerald-700 text-white rounded-br-md"
                  : "bg-zinc-100 text-zinc-900 rounded-bl-md"
              }`}
            >
              <p>{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.user_id === userId ? "text-emerald-200" : "text-zinc-400"
                }`}
              >
                {formatRelativeTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-zinc-100 bg-white">
        <div className="flex items-center gap-2">
          <button type="button" className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200">
            <Paperclip className="h-4 w-4 text-zinc-500" />
          </button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
