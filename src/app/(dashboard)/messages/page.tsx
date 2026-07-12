"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id)
        .then(({ data: participations }) => {
          const ids = participations?.map((p: any) => p.conversation_id) || []
          if (ids.length === 0) {
            setLoading(false)
            return
          }

          supabase
            .from("conversations")
            .select("*, conversation_participants!inner(*, profiles!inner(name, phone)), private_messages(text, created_at, sender_id)")
            .in("id", ids)
            .order("created_at", { ascending: false })
            .then(({ data }) => {
              if (data) setConversations(data)
              setLoading(false)
            })
        })
    })
  }, [supabase])

  const getOtherParticipant = (conv: any) =>
    conv.conversation_participants?.find((p: any) => p.user_id !== userId)?.profiles

  const getLastMessage = (conv: any) => {
    const msgs = conv.private_messages || []
    return msgs[msgs.length - 1]
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="h-4 w-4 text-zinc-600" />
        </Link>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-zinc-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-zinc-200 rounded" />
                    <div className="h-3 w-48 bg-zinc-100 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No conversations yet.</p>
              <p className="text-sm text-zinc-400 mt-1">Find someone to chat with!</p>
              <Link
                href="/people"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Find People
              </Link>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv)
            const last = getLastMessage(conv)
            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={other?.avatar_url} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {(other?.name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{other?.name || "Unknown"}</h3>
                        {last && (
                          <span className="text-xs text-zinc-400 shrink-0 ml-2">
                            {formatRelativeTime(last.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 truncate mt-0.5">
                        {last ? last.text : "No messages yet"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
