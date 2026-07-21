"use client"
import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function NewMessageRedirect() {
  const router = useRouter()
  const { userId } = useParams<{ userId: string }>()
  useEffect(() => { router.replace(`/chat/new/${userId}`) }, [userId, router])
  return (
    <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
