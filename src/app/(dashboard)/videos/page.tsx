"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Video, Upload } from "lucide-react"
import Link from "next/link"

type Profile = {
  name: string | null
}

type Comment = {
  id: string
  videoId: string
  text: string
  createdAt: string
  userId: string
  user: { name: string | null }
}

type VideoItem = {
  id: string
  title: string
  description: string | null
  url: string
  thumbnailUrl: string | null
  createdAt: string
  userId: string
  user: Profile
  likesCount?: number
  commentsCount?: number
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  const fetchVideos = useCallback(async () => {
    const res = await fetch("/api/videos")
    if (res.ok) {
      const data = await res.json()
      const mapped = data.map((v: any) => ({
        ...v,
        profiles: v.user,
      }))
      setVideos(mapped)
    }
    setLoading(false)
  }, [])

  const fetchLikes = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) return

    const counts: Record<string, number> = {}
    const liked: Set<string> = new Set()

    const results = await Promise.all(
      videoIds.map(async (vidId) => {
        const res = await fetch(`/api/videos/${vidId}/like`)
        if (!res.ok) return { vidId, count: 0, isLiked: false }
        const data = await res.json()
        return { vidId, count: data.count, isLiked: data.liked }
      })
    )

    for (const r of results) {
      counts[r.vidId] = r.count
      if (r.isLiked) liked.add(r.vidId)
    }

    setVideoLikes(counts)
    setLikedIds(liked)
  }, [])

  const fetchComments = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) return

    const grouped: Record<string, Comment[]> = {}

    const results = await Promise.all(
      videoIds.map(async (vidId) => {
        const res = await fetch(`/api/videos/${vidId}/comments`)
        if (!res.ok) return { vidId, comments: [] }
        const data = await res.json()
        const mapped = data.map((c: any) => ({
          ...c,
          profiles: c.user,
        }))
        return { vidId, comments: mapped }
      })
    )

    for (const r of results) {
      grouped[r.vidId] = r.comments
    }

    setComments(grouped)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser(user)
    })
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  useEffect(() => {
    if (!loading && videos.length > 0) {
      const ids = videos.map((v) => v.id)
      fetchLikes(ids)
      fetchComments(ids)
    }
  }, [loading, videos, fetchLikes, fetchComments])

  const handleLike = async (videoId: string) => {
    if (!currentUser) return

    const res = await fetch(`/api/videos/${videoId}/like`, { method: "POST" })
    if (!res.ok) return

    const { liked, count } = await res.json()

    if (liked) {
      setLikedIds((prev) => {
        const next = new Set(prev)
        next.add(videoId)
        return next
      })
    } else {
      setLikedIds((prev) => {
        const next = new Set(prev)
        next.delete(videoId)
        return next
      })
    }
    setVideoLikes((prev) => ({ ...prev, [videoId]: count }))
  }

  const handleCommentSubmit = async (videoId: string) => {
    const text = commentTexts[videoId]?.trim()
    if (!text || !currentUser) return

    setSubmittingComment((prev) => ({ ...prev, [videoId]: true }))

    await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    const res = await fetch(`/api/videos/${videoId}/comments`)
    if (res.ok) {
      const data = await res.json()
      const mapped = data.map((c: any) => ({
        ...c,
        profiles: c.commenter,
      }))
      setComments((prev) => ({ ...prev, [videoId]: mapped }))
    }

    setCommentTexts((prev) => ({ ...prev, [videoId]: "" }))
    setSubmittingComment((prev) => ({ ...prev, [videoId]: false }))
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Videos</h1>
        <Link
          href="/videos/upload"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Upload className="h-4 w-4 mr-1.5" />
          Upload
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="aspect-video bg-zinc-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3 animate-pulse" />
                  <div className="h-5 bg-zinc-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-zinc-100 rounded w-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Video className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No videos yet</p>
            <p className="text-sm text-zinc-400 mt-1">Share your first community video!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {videos.map((video) => {
            const embedUrl = getYoutubeEmbedUrl(video.url)
            const videoComments = comments[video.id] || []
            const likeCount = videoLikes[video.id] || 0
            const isLiked = likedIds.has(video.id)

            return (
              <Card key={video.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                      {(video.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{video.user?.name || "Unknown"}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {embedUrl ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-zinc-100 flex items-center justify-center">
                      <Video className="h-8 w-8 text-zinc-300" />
                    </div>
                  )}

                  <div className="px-4 pt-3 pb-1">
                    <h3 className="font-semibold">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-zinc-600 mt-0.5">{video.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 px-4 py-2 border-t border-zinc-100 mt-2">
                    <button
                      onClick={() => handleLike(video.id)}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm transition-colors ${
                        isLiked
                          ? "text-red-500 bg-red-50 hover:bg-red-100"
                          : "text-zinc-500 hover:bg-zinc-100"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`}
                      />
                      {likeCount > 0 && <span>{likeCount}</span>}
                    </button>
                    <span className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm text-zinc-500">
                      <MessageCircle className="h-4 w-4" />
                      {videoComments.length > 0 && <span>{videoComments.length}</span>}
                    </span>
                  </div>

                  {videoComments.length > 0 && (
                    <div className="px-4 pb-2 space-y-2 border-t border-zinc-100 pt-2">
                      {videoComments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="h-6 w-6 mt-0.5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-semibold text-zinc-600 shrink-0">
                            {(comment.user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold">
                              {comment.user?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-zinc-500 ml-1">
                              {comment.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentTexts[video.id] || ""}
                      onChange={(e) =>
                        setCommentTexts((prev) => ({
                          ...prev,
                          [video.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleCommentSubmit(video.id)
                        }
                      }}
                      className="h-9 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCommentSubmit(video.id)}
                      disabled={
                        !commentTexts[video.id]?.trim() || submittingComment[video.id]
                      }
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
