"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChatRoom } from "./chat-room"

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        setLoading(false)
        if (!data || error) {
          setNotFoundState(true)
          return
        }
        setRoom(data)
      })
  }, [id, supabase])

  if (notFoundState) notFound()
  if (loading) return <div className="min-h-dvh bg-zinc-950 flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>
  if (!room) return null

  return <ChatRoom room={room} />
}
