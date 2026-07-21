"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Comment {
  id: string
  text: string
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
}

interface ComplaintDetail {
  id: string
  title: string
  description: string
  category: string | null
  status: string
  isAnonymous: boolean
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
  comments: Comment[]
}

const statusColors: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  acknowledged: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  resolved: "bg-emerald-100 text-emerald-800",
  dismissed: "bg-zinc-100 text-zinc-600",
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetch(`/api/governance/complaints/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setComplaint(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/governance/complaints/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      })

      if (res.ok) {
        const comment = await res.json()
        setComplaint((prev) =>
          prev ? { ...prev, comments: [...prev.comments, comment] } : prev
        )
        setCommentText("")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-zinc-100 rounded-lg animate-pulse" />
          <div className="h-40 bg-zinc-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto text-center py-12 text-zinc-400">
        Complaint not found
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-xl font-bold text-zinc-900">{complaint.title}</h1>
            <span className={`whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[complaint.status] || "bg-zinc-100 text-zinc-600"}`}>
              {complaint.status.replace(/_/g, " ")}
            </span>
          </div>

          <p className="text-sm text-zinc-600 mb-4 whitespace-pre-wrap">{complaint.description}</p>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>{complaint.isAnonymous ? "Anonymous" : complaint.user.name}</span>
            {complaint.category && <Badge variant="secondary">{complaint.category}</Badge>}
            <span>{formatRelativeTime(complaint.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold text-zinc-900 mb-3">
        Comments ({complaint.comments.length})
      </h3>

      <div className="space-y-3 mb-6">
        {complaint.comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-zinc-900">{comment.user.name}</p>
                <span className="text-xs text-zinc-400">{formatRelativeTime(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-zinc-600">{comment.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            />
            <Button type="submit" size="sm" disabled={submitting || !commentText.trim()}>
              {submitting ? "..." : "Send"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
