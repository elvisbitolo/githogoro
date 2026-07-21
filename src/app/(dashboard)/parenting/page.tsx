"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Baby, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface ParentingPost {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

const CATEGORY_COLORS: Record<string, string> = {
  tips: "bg-emerald-100 text-emerald-700",
  milestones: "bg-blue-100 text-blue-700",
  advice: "bg-amber-100 text-amber-700",
  health: "bg-red-100 text-red-700",
  education: "bg-purple-100 text-purple-700",
  general: "bg-zinc-100 text-zinc-700",
}

export default function ParentingPage() {
  const [posts, setPosts] = useState<ParentingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", content: "", category: "general" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/parenting")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPosts(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    try {
      const res = await fetch("/api/parenting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const newPost = await res.json()
        setPosts((prev) => [newPost, ...prev])
        setForm({ title: "", content: "", category: "general" })
        setShowForm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Parenting Board</h1>
          <p className="text-zinc-500 text-sm mt-1">Tips, advice, and support for parents</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Title *</label>
              <Input placeholder="Post title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Category</label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="tips">Tips</option>
                <option value="milestones">Milestones</option>
                <option value="advice">Advice</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Content *</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                placeholder="Share your parenting experience..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? "Posting..." : "Post"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-32" /></Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Baby className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No parenting posts yet</p>
            <p className="text-sm text-zinc-400 mt-1">Share your parenting journey with the community</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">{post.title}</h3>
                  <Badge className={`${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general} text-[10px]`}>{post.category}</Badge>
                </div>
                <p className="text-sm text-zinc-600 mt-2 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
                  <span>{post.user.name} {post.user.zone && <span className="text-zinc-300">&middot; {post.user.zone}</span>}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(post.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
