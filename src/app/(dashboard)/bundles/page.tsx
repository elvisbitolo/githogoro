"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Wifi, Search, Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { BundleCard } from "./bundle-card"

interface Bundle {
  id: string
  name: string
  provider: string
  price: number
  dataAmount: string
  validity: string
  category: string
  url: string | null
  description: string | null
  upvotes: number
  downvotes: number
  createdBy: string
  createdAt: string
  creator?: { id: string; name: string; avatarUrl: string | null }
}

const PROVIDERS = [
  { key: "all", label: "All" },
  { key: "safaricom", label: "Safaricom" },
  { key: "airtel", label: "Airtel" },
  { key: "telkom", label: "Telkom" },
]

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeProvider, setActiveProvider] = useState("all")
  const [search, setSearch] = useState("")
  const [userVotes, setUserVotes] = useState<Record<string, string | null>>({})
  const supabase = createClient()

  const fetchBundles = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeProvider !== "all") params.set("provider", activeProvider)
    if (search) params.set("search", search)

    const res = await fetch(`/api/bundles?${params}`)
    const data = await res.json()
    setBundles(data || [])
    setLoading(false)
  }, [activeProvider, search])

  useEffect(() => {
    fetchBundles()
  }, [fetchBundles])

  useEffect(() => {
    async function loadUserVotes() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || bundles.length === 0) return

      const votes: Record<string, string | null> = {}
      for (const b of bundles) {
        const res = await fetch(`/api/bundles/${b.id}`)
        const detail = await res.json()
        const myVote = detail.votes?.find((v: { userId: string; type: string }) => v.userId === user.id)
        votes[b.id] = myVote?.type || null
      }
      setUserVotes(votes)
    }
    loadUserVotes()
  }, [bundles, supabase])

  async function handleVote(bundleId: string, type: string) {
    const res = await fetch(`/api/bundles/${bundleId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })

    if (res.ok) {
      const { upvotes, downvotes, voted } = await res.json()
      setBundles((prev) =>
        prev.map((b) => (b.id === bundleId ? { ...b, upvotes, downvotes } : b))
      )
      setUserVotes((prev) => ({ ...prev, [bundleId]: voted }))
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Wifi className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bundles</h1>
            <p className="text-sm text-zinc-500">Share & find the best data deals</p>
          </div>
        </div>
        <Link
          href="/bundles/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Share Bundle
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveProvider(p.key)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeProvider === p.key
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search bundles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-zinc-100 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wifi className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No bundles found</p>
            <p className="text-sm text-zinc-400 mt-1">Be the first to share a bundle!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              userVote={userVotes[bundle.id]}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  )
}
