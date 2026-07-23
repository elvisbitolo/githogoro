"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Trash2, Search, HandCoins, Users, FileText,
  Calendar, Briefcase, BarChart3, ChevronLeft, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

type ContentType = "harambee" | "tontine" | "petition" | "event" | "job" | "poll"

interface ContentItem {
  id: string
  name?: string
  title?: string
  question?: string
  description?: string
  createdAt: string
  creator?: { id: string; name: string }
  postedByUser?: { id: string; name: string }
  _count?: Record<string, number>
  goal?: number
  raised?: number
  amount?: number
  status?: string
}

const contentTypes: { type: ContentType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "harambee", label: "Harambees", icon: HandCoins, color: "text-emerald-400" },
  { type: "tontine", label: "Tontines", icon: Users, color: "text-blue-400" },
  { type: "petition", label: "Petitions", icon: FileText, color: "text-amber-400" },
  { type: "event", label: "Events", icon: Calendar, color: "text-purple-400" },
  { type: "job", label: "Jobs", icon: Briefcase, color: "text-cyan-400" },
  { type: "poll", label: "Polls", icon: BarChart3, color: "text-pink-400" },
]

function getItemTitle(item: ContentItem): string {
  return item.title || item.name || item.question || "Untitled"
}

function getItemMeta(item: ContentItem, type: ContentType): string {
  if (type === "harambee" && item.goal) {
    return `KES ${(item.raised || 0).toLocaleString()} / ${item.goal.toLocaleString()}`
  }
  if (item._count) {
    const counts = Object.entries(item._count)
    if (counts.length > 0) {
      return counts.map(([k, v]) => `${v} ${k}`).join(", ")
    }
  }
  if (item.status) return item.status
  return ""
}

export default function AdminContentPage() {
  const [activeType, setActiveType] = useState<ContentType>("harambee")
  const [items, setItems] = useState<ContentItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: ContentItem | null }>({ open: false, item: null })
  const [refetchKey, setRefetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/content?type=${activeType}&page=${page}`)
        const data = await res.json()
        if (!cancelled) {
          setItems(data.items || [])
          setTotal(data.total || 0)
        }
      } catch {
        if (!cancelled) {
          setItems([])
          setTotal(0)
        }
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [activeType, page, refetchKey])

  const handleTypeChange = (newType: ContentType) => {
    setActiveType(newType)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteDialog.item) return
    const item = deleteDialog.item
    setDeleteDialog({ open: false, item: null })
    await fetch(`/api/admin/content?type=${activeType}&id=${item.id}`, { method: "DELETE" })
    setRefetchKey((k) => k + 1)
  }

  const filtered = items.filter((item) => {
    if (!search) return true
    const title = getItemTitle(item).toLowerCase()
    const creator = (item.creator?.name || item.postedByUser?.name || "").toLowerCase()
    return title.includes(search.toLowerCase()) || creator.includes(search.toLowerCase())
  })

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-5 w-5 text-amber-500" />
          <h1 className="text-xl font-bold">Content Moderation</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {contentTypes.map((ct) => (
            <button
              key={ct.type}
              onClick={() => handleTypeChange(ct.type)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeType === ct.type
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <ct.icon className={`h-4 w-4 ${activeType === ct.type ? ct.color : ""}`} />
              {ct.label}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            placeholder={`Search ${activeType}s...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700"
          />
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              <span>{contentTypes.find((c) => c.type === activeType)?.label} ({total})</span>
              {totalPages > 1 && (
                <span className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs">Page {page} of {totalPages}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-zinc-800/50 animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <p className="text-sm text-zinc-600">No {activeType}s found.</p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="rounded-lg bg-zinc-800/50 p-3 text-sm flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-zinc-200 truncate">{getItemTitle(item)}</span>
                      {item.status && item.status !== "active" && (
                        <Badge variant="outline" className="text-[10px] text-zinc-500 shrink-0">{item.status}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>by {item.creator?.name || item.postedByUser?.name || "Unknown"}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {getItemMeta(item, activeType) && (
                        <span className="text-zinc-600">{getItemMeta(item, activeType)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteDialog({ open: true, item })}
                    className="rounded-lg p-1.5 hover:bg-red-900/30 transition-colors shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, item: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete {activeType}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete <strong className="text-zinc-200">{deleteDialog.item ? getItemTitle(deleteDialog.item) : ""}</strong>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, item: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
