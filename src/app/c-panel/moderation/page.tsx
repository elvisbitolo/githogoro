"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminModerationPage() {
  const [latestMessages, setLatestMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("messages")
      .select("*, profiles!inner(name)")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setLatestMessages(data)
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
          <Shield className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold">Moderation</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!latestMessages || latestMessages.length === 0) ? (
              <p className="text-sm text-zinc-600">No messages to review.</p>
            ) : (
              latestMessages.map((msg: any) => (
                <div key={msg.id} className="rounded-lg bg-zinc-800/50 p-3 text-sm">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    <span className="font-medium text-zinc-300">{msg.profiles?.name || "Unknown"}</span>
                    <span>{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-zinc-400">{msg.text || "[media]"}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
