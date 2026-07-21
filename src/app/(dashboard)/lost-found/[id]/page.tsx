"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar, Search, User, CheckCircle, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ItemDetail {
  id: string
  title: string
  description: string | null
  category: string
  location: string | null
  photo: string | null
  type: "lost" | "found"
  status: "active" | "resolved"
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
}

export default function LostFoundDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [item, setItem] = useState<ItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })

    fetch(`/api/lost-found/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setItem(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [id, supabase])

  async function handleAction(action: "found-this" | "is-mine") {
    if (!item || !currentUserId) return

    setActionLoading(action)
    try {
      const res = await fetch("/api/conversations/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: item.user.id }),
      })

      if (!res.ok) {
        setActionLoading(null)
        return
      }

      const conversation = await res.json()
      const convId = conversation.id

      router.push(`/chat/${convId}`)
    } catch {
      setActionLoading(null)
    }
  }

  async function handleMarkResolved() {
    if (!item) return

    setActionLoading("resolve")
    try {
      const res = await fetch(`/api/lost-found/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      })

      if (res.ok) {
        setItem({ ...item, status: "resolved" })
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete() {
    if (!item) return
    if (!confirm("Are you sure you want to delete this report?")) return

    setActionLoading("delete")
    try {
      const res = await fetch(`/api/lost-found/${item.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/lost-found")
      }
    } catch {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
          <Card>
            <CardContent className="p-0">
              <div className="h-64 bg-zinc-100 animate-pulse rounded-t-xl" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-48 bg-zinc-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                <div className="h-16 bg-zinc-100 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link
          href="/lost-found"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lost & Found
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Item not found</p>
            <p className="text-sm text-zinc-400 mt-1 text-center max-w-sm">
              This report may have been removed by the reporter.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = currentUserId === item.user.id
  const isResolved = item.status === "resolved"

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/lost-found"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Lost & Found
      </Link>

      <Card className="overflow-hidden">
        {item.photo && (
          <img
            src={item.photo}
            alt={item.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        )}

        <CardContent className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className={`text-xl font-bold ${isResolved ? "line-through" : ""}`}>
                {item.title}
              </h1>
              <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                {item.type === "lost" ? "Lost" : "Found"}
              </Badge>
              <Badge variant="secondary">
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Badge>
              {isResolved && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Resolved
                </Badge>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-zinc-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            {item.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                {item.location}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(item.createdAt)}
            </span>
          </div>

          <div className="border-t border-zinc-100 pt-4">
            <div className="flex items-center gap-3">
              {item.user.avatarUrl ? (
                <img
                  src={item.user.avatarUrl}
                  alt={item.user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  Reported by {item.user.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {!isOwner && !isResolved && (
            <div className="border-t border-zinc-100 pt-4 space-y-3">
              <Button
                onClick={() => handleAction(item.type === "lost" ? "found-this" : "is-mine")}
                disabled={actionLoading !== null}
                className="w-full"
              >
                {actionLoading === "found-this" || actionLoading === "is-mine" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {item.type === "lost" ? "I Found This" : "This is Mine"}
              </Button>
              <p className="text-xs text-zinc-400 text-center">
                This will open a direct message with {item.user.name}
              </p>
            </div>
          )}

          {isOwner && !isResolved && (
            <div className="border-t border-zinc-100 pt-4 flex gap-3">
              <Button
                onClick={handleMarkResolved}
                disabled={actionLoading === "resolve"}
                className="flex-1"
              >
                {actionLoading === "resolve" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Mark as Resolved
              </Button>
              <Button
                onClick={handleDelete}
                disabled={actionLoading === "delete"}
                variant="destructive"
                className="flex-1"
              >
                {actionLoading === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
