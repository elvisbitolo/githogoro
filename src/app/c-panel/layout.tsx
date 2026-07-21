"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/verify")
        const data = await res.json()
        if (data.isAdmin) {
          setAuthorized(true)
        } else {
          router.replace("/")
        }
      } catch {
        router.replace("/")
      }
    })()
  }, [router])

  if (authorized === null) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
