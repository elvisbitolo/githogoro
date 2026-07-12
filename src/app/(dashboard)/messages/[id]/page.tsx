"use client"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [userId, setUserId] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })

    supabase
      .from("conversations")
      .select("*, conversation_participants(*, profiles(*))")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setConversation(data)
      })

    supabase
      .from("private_messages")
      .select("*, profiles!inner(name)")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data)
        setLoading(false)
      })
  }, [id, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !userId) return

    const { error } = await supabase.from("private_messages").insert({
      conversation_id: id,
      sender_id: userId,
      text: text.trim(),
    })

    if (!error) setText("")
  }

  const otherParticipant = conversation?.conversation_participants?.find(
    (p: any) => p.user_id !== userId
  )?.profiles

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-100 bg-white shrink-0">
        <Link href="/messages" className="lg:hidden">
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherParticipant?.avatar_url} />
          <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
            {(otherParticipant?.name || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-sm">{otherParticipant?.name || "Conversation"}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400">Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.sender_id === userId ? "flex-row-reverse" : ""}`}
            >
              <div className="shrink-0">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={msg.profiles?.avatar_url} />
                  <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                    {(msg.profiles?.name || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  msg.sender_id === userId
                    ? "bg-emerald-700 text-white rounded-br-md"
                    : "bg-zinc-100 text-zinc-900 rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.sender_id === userId ? "text-emerald-200" : "text-zinc-400"
                  }`}
                >
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-zinc-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
