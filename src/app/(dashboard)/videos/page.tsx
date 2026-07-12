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
  video_id: string
  text: string
  created_at: string
  user_id: string
  profiles: { name: string | null }
}

type VideoItem = {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail_url: string | null
  created_at: string
  user_id: string
  profiles: Profile
  likes_count?: number
  comments_count?: number
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
    const { data } = await supabase
      .from("videos")
      .select("*, profiles!inner(name)")
      .order("created_at", { ascending: false })

    if (data) setVideos(data as unknown as VideoItem[])
    setLoading(false)
  }, [supabase])

  const fetchLikes = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) return

    const { data: likesData } = await supabase
      .from("video_likes")
      .select("video_id, user_id")

    if (!likesData) return

    const counts: Record<string, number> = {}
    const liked: Set<string> = new Set()
    const userId = currentUser?.id

    for (const like of likesData) {
      counts[like.video_id] = (counts[like.video_id] || 0) + 1
      if (userId && like.user_id === userId) {
        liked.add(like.video_id)
      }
    }

    setVideoLikes(counts)
    setLikedIds(liked)
  }, [supabase, currentUser])

  const fetchComments = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) return

    const { data: commentsData } = await supabase
      .from("video_comments")
      .select("*, profiles(name)")
      .in("video_id", videoIds)
      .order("created_at", { ascending: true })

    if (!commentsData) return

    const grouped: Record<string, Comment[]> = {}
    for (const comment of commentsData) {
      const c = comment as unknown as Comment
      if (!grouped[c.video_id]) grouped[c.video_id] = []
      grouped[c.video_id].push(c)
    }

    setComments(grouped)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser(user)
    })
  }, [supabase])

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

    const alreadyLiked = likedIds.has(videoId)

    if (alreadyLiked) {
      await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", currentUser.id)

      setLikedIds((prev) => {
        const next = new Set(prev)
        next.delete(videoId)
        return next
      })
      setVideoLikes((prev) => ({
        ...prev,
        [videoId]: Math.max(0, (prev[videoId] || 0) - 1),
      }))
    } else {
      await supabase.from("video_likes").insert({
        video_id: videoId,
        user_id: currentUser.id,
      })

      setLikedIds((prev) => {
        const next = new Set(prev)
        next.add(videoId)
        return next
      })
      setVideoLikes((prev) => ({
        ...prev,
        [videoId]: (prev[videoId] || 0) + 1,
      }))
    }
  }

  const handleCommentSubmit = async (videoId: string) => {
    const text = commentTexts[videoId]?.trim()
    if (!text || !currentUser) return

    setSubmittingComment((prev) => ({ ...prev, [videoId]: true }))

    await supabase.from("video_comments").insert({
      video_id: videoId,
      user_id: currentUser.id,
      text,
    })

    const { data: newComments } = await supabase
      .from("video_comments")
      .select("*, profiles(name)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: true })

    if (newComments) {
      setComments((prev) => ({
        ...prev,
        [videoId]: newComments as unknown as Comment[],
      }))
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
                      {(video.profiles?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{video.profiles?.name || "Unknown"}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(video.created_at).toLocaleDateString()}
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
                            {(comment.profiles?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold">
                              {comment.profiles?.name || "Unknown"}
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
