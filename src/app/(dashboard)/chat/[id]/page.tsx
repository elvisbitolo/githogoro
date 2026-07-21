"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DMView } from "./dm-view"

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const [conversation, setConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    fetch(`/api/conversations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setConversation(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <p className="text-zinc-500">Conversation not found</p>
      </div>
    )
  }

  return <DMView conversation={conversation} />
}
