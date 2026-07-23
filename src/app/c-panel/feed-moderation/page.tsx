"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft, Search, Trash2, Heart, MessageSquare, Share2,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

interface Post {
  id: string
  content: string | null
  mediaUrls: unknown
  createdAt: string
  likesCount: number
  commentsCount: number
  user?: { id: string; name: string; avatarUrl: string | null }
  _count?: { likes: number; comments: number; shares: number }
}

export default function FeedModerationPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; post: Post | null }>({
    open: false, post: null,
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const res = await fetch("/api/admin/posts?limit=50")
    const data = await res.json()
    if (Array.isArray(data)) setPosts(data)
    setLoading(false)
  }

  const filtered = posts.filter(
    (p) =>
      !search ||
      p.content?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (post: Post) => {
    setDeleteDialog({ open: false, post: null })
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" })
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold">Feed Moderation</h1>
            <Badge variant="outline" className="text-zinc-500">{filtered.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search posts or users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 rounded-lg bg-zinc-800/50 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">No posts found.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filtered.map((post) => (
                  <div key={post.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                          {post.user?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{post.user?.name || "Unknown"}</span>
                            <span className="text-xs text-zinc-600">
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => setDeleteDialog({ open: true, post })}
                            className="rounded-lg p-1.5 hover:bg-red-900/30 transition-colors"
                            title="Delete post"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </button>
                        </div>
                        {post.content && (
                          <p className="text-sm text-zinc-400 line-clamp-3 mb-2">{post.content}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-zinc-600">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {post._count?.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {post._count?.comments || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" /> {post._count?.shares || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, post: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Permanently delete this post by <strong className="text-zinc-200">{deleteDialog.post?.user?.name}</strong>? This action cannot be undone.
          </p>
          {deleteDialog.post?.content && (
            <div className="rounded-lg bg-zinc-800/50 p-3 text-sm text-zinc-500 line-clamp-3">
              &quot;{deleteDialog.post.content}&quot;
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, post: null })}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteDialog.post && handleDelete(deleteDialog.post)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
