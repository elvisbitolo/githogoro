"use client"
import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function MessageRedirect() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  useEffect(() => { router.replace(`/chat/${id}`) }, [id, router])
  return (
    <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
