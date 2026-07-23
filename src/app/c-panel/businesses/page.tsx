"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft, Search, Star, Trash2, Briefcase, MapPin, Phone,
  Loader2, Eye,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

interface Business {
  id: string
  name: string
  category: string
  description: string | null
  phone: string
  isFeatured: boolean
  photos: string[]
  createdAt: string
  creator?: { name: string } | null
  owner?: { name: string } | null
  _count?: { reviews: number }
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; business: Business | null }>({
    open: false, business: null,
  })
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; business: Business | null }>({
    open: false, business: null,
  })

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    const res = await fetch("/api/admin/businesses")
    const data = await res.json()
    if (Array.isArray(data)) setBusinesses(data)
    setLoading(false)
  }

  const filtered = businesses.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleFeature = async (business: Business) => {
    setUpdating(business.id)
    try {
      await fetch(`/api/admin/businesses/${business.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !business.isFeatured }),
      })
      setBusinesses((prev) =>
        prev.map((b) => (b.id === business.id ? { ...b, isFeatured: !b.isFeatured } : b))
      )
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (business: Business) => {
    setDeleteDialog({ open: false, business: null })
    setUpdating(business.id)
    try {
      await fetch(`/api/admin/businesses/${business.id}`, { method: "DELETE" })
      setBusinesses((prev) => prev.filter((b) => b.id !== business.id))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold">Business Moderation</h1>
            <Badge variant="outline" className="text-zinc-500">{businesses.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-500 text-sm">No businesses found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((b) => (
              <div key={b.id} className="flex items-center gap-4 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-purple-900/50 text-purple-400">
                    {b.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{b.name}</p>
                    {b.isFeatured && (
                      <Badge className="h-5 text-[10px] bg-amber-600"><Star className="h-2.5 w-2.5 mr-0.5" /> Featured</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] text-zinc-400">{b.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    {b.creator && <span>by {b.creator.name}</span>}
                    <span>{b._count?.reviews || 0} reviews</span>
                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {updating === b.id ? (
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs px-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setDetailDialog({ open: true, business: b })}
                        className="rounded-lg border border-zinc-800 p-1.5 hover:bg-zinc-800 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => handleToggleFeature(b)}
                        className={`rounded-lg border p-1.5 transition-colors ${
                          b.isFeatured
                            ? "border-amber-900/50 hover:bg-amber-900/30"
                            : "border-zinc-800 hover:bg-zinc-800"
                        }`}
                        title={b.isFeatured ? "Unfeature" : "Feature"}
                      >
                        <Star className={`h-4 w-4 ${b.isFeatured ? "text-amber-400 fill-amber-400" : "text-zinc-400"}`} />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, business: b })}
                        className="rounded-lg border border-zinc-800 p-1.5 hover:bg-red-900/30 hover:border-red-900/50 transition-colors"
                        title="Delete business"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, business: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete Business</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Permanently delete &quot;{deleteDialog.business?.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, business: null })}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteDialog.business && handleDelete(deleteDialog.business)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, business: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailDialog.business?.name}</DialogTitle>
          </DialogHeader>
          {detailDialog.business && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Briefcase className="h-4 w-4" /> {detailDialog.business.category}
              </div>
              {detailDialog.business.description && (
                <p className="text-zinc-400">{detailDialog.business.description}</p>
              )}
              {detailDialog.business.phone && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="h-4 w-4" /> {detailDialog.business.phone}
                </div>
              )}
              {detailDialog.business.creator && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>Created by {detailDialog.business.creator.name}</span>
                </div>
              )}
              <div className="text-xs text-zinc-600">
                {new Date(detailDialog.business.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
