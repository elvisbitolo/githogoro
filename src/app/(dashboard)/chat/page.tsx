"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Plus } from "lucide-react"
import Link from "next/link"

export default function ChatPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.from("chat_rooms").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setRooms(data)
      setLoading(false)
    })
  }, [supabase])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chat</h1>
        <Link
          href="/chat/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Chat
        </Link>
      </div>

      <div className="space-y-3">
        {!rooms || rooms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No chat rooms yet</p>
              <p className="text-sm text-zinc-400 mt-1">Create the first community chat room!</p>
            </CardContent>
          </Card>
        ) : (
          rooms.map((room) => (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-zinc-500 capitalize">{room.type} chat</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
