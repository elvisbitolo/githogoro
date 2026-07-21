"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const ADMIN_USER_ID = "c98312cd-b4c7-43e4-9336-c5058f3a954e"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== ADMIN_USER_ID) {
        router.replace("/")
      } else {
        setAuthorized(true)
      }
    })()
  }, [router, supabase])

  if (authorized === null) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
