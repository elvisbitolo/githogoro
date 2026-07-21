"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ThumbsUp, ThumbsDown, ExternalLink, Share2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"

const PROVIDER_CONFIG: Record<string, { color: string }> = {
  safaricom: { color: "#E3002B" },
  airtel: { color: "#ED1C24" },
  telkom: { color: "#00A651" },
  other: { color: "#71717a" },
}

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
  votes?: { userId: string; type: string }[]
}

export default function BundleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const res = await fetch(`/api/bundles/${id}`)
      const data = await res.json()
      if (data && !data.error) {
        setBundle(data)
        if (user) {
          const myVote = data.votes?.find((v: { userId: string; type: string }) => v.userId === user.id)
          setUserVote(myVote?.type || null)
        }
      }
      setLoading(false)
    }
    if (id) load()
  }, [id, supabase])

  async function handleVote(type: string) {
    const res = await fetch(`/api/bundles/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
    if (res.ok) {
      const { upvotes, downvotes, voted } = await res.json()
      setBundle((prev) => (prev ? { ...prev, upvotes, downvotes } : prev))
      setUserVote(voted)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this bundle?")) return
    setDeleting(true)
    const res = await fetch(`/api/bundles/${id}`, { method: "DELETE" })
    if (res.ok) router.push("/bundles")
    else setDeleting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <p className="text-zinc-500">Bundle not found</p>
      </div>
    )
  }

  const config = PROVIDER_CONFIG[bundle.provider] || PROVIDER_CONFIG.other
  const score = bundle.upvotes - bundle.downvotes

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/bundles"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bundles
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: config.color + "15", color: config.color }}
            >
              {bundle.provider.charAt(0).toUpperCase() + bundle.provider.slice(1)}
            </span>
            <Badge variant="outline">{bundle.category}</Badge>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 mb-4">{bundle.name}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-xs text-emerald-600 font-medium">Price</p>
              <p className="text-lg font-bold text-emerald-700">Ksh {bundle.price.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-center">
              <p className="text-xs text-blue-600 font-medium">Data</p>
              <p className="text-lg font-bold text-blue-700">{bundle.dataAmount}</p>
            </div>
            <div className="rounded-xl bg-zinc-100 p-3 text-center">
              <p className="text-xs text-zinc-500 font-medium">Validity</p>
              <p className="text-lg font-bold text-zinc-700">{bundle.validity}</p>
            </div>
          </div>

          {bundle.description && (
            <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{bundle.description}</p>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote("up")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  userVote === "up"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                {bundle.upvotes}
              </button>
              <button
                onClick={() => handleVote("down")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  userVote === "down"
                    ? "bg-red-100 text-red-600"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                {bundle.downvotes}
              </button>
            </div>

            {bundle.url && (
              <a
                href={bundle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                <ExternalLink className="h-4 w-4" />
                Open Link
              </a>
            )}

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: bundle.name, url: `/bundles/${bundle.id}` })
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {userId === bundle.createdBy && (
            <div className="pt-4 border-t border-zinc-100">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete Bundle"}
              </Button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
            Shared by {bundle.creator?.name} · {formatDate(bundle.createdAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
