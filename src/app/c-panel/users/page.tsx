"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setProfiles(data)
      setLoading(false)
    })
  }, [supabase])

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-bold">User Management</h1>
        </div>

        <div className="space-y-2">
          {(!profiles || profiles.length === 0) ? (
            <p className="text-zinc-500">No users yet.</p>
          ) : (
            profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400">{p.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.name}</p>
                    {p.is_verified && <Badge variant="default" className="h-5 text-[10px]">✓</Badge>}
                  </div>
                  <p className="text-sm text-zinc-500">{p.phone}</p>
                </div>
                <div className="text-right text-xs text-zinc-600">
                  <p className="capitalize">{p.role}</p>
                  <p>Score: {p.reputation_score}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
