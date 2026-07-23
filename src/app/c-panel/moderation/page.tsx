"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowLeft, Trash2, AlertTriangle, Search, Filter } from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

interface Message {
  id: string
  text: string | null
  mediaUrls: unknown
  createdAt: string
  user?: { id: string; name: string }
}

export default function AdminModerationPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [warnDialog, setWarnDialog] = useState<{ open: boolean; userId: string | null; userName: string }>({
    open: false, userId: null, userName: "",
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch("/api/admin/messages")
      const data = await res.json()
      if (!cancelled) {
        setMessages(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = messages.filter((msg) => {
    const matchesSearch = !search ||
      msg.text?.toLowerCase().includes(search.toLowerCase()) ||
      msg.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesDate = !dateFilter ||
      new Date(msg.createdAt).toISOString().slice(0, 10) >= dateFilter
    return matchesSearch && matchesDate
  })

  const handleDeleteMessage = async (id: string) => {
    setDeleteDialog({ open: false, id: null })
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" })
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const handleWarnUser = async (userId: string) => {
    if (!userId) return
    await fetch(`/api/admin/users/${userId}/warn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Violating community guidelines" }),
    })
    setWarnDialog({ open: false, userId: null, userName: "" })
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold">Moderation</h1>
          <Badge variant="outline" className="text-zinc-500">{filtered.length}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search messages or users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 w-48 bg-zinc-900 border-zinc-800 text-zinc-100"
            />
          </div>
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>
              Clear
            </Button>
          )}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-zinc-800/50 animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <p className="text-sm text-zinc-600">No messages found.</p>
            ) : (
              filtered.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-zinc-800/50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-medium text-zinc-300">{msg.user?.name || "Unknown"}</span>
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          msg.user?.id && setWarnDialog({
                            open: true,
                            userId: msg.user.id,
                            userName: msg.user.name || "Unknown",
                          })
                        }
                        className="rounded-lg p-1.5 hover:bg-amber-900/30 transition-colors"
                        title="Warn user"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, id: msg.id })}
                        className="rounded-lg p-1.5 hover:bg-red-900/30 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-400">{msg.text || "[media]"}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">Are you sure you want to delete this message? This cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteDialog.id && handleDeleteMessage(deleteDialog.id)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={warnDialog.open} onOpenChange={(open) => setWarnDialog({ open, userId: null, userName: "" })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Warn User
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Send a warning notification to <strong className="text-zinc-200">{warnDialog.userName}</strong>?
            They will receive an alert about violating community guidelines.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setWarnDialog({ open: false, userId: null, userName: "" })}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => warnDialog.userId && handleWarnUser(warnDialog.userId)}>
              Send Warning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
