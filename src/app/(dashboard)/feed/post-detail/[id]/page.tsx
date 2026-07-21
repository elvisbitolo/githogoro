"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  MapPin,
  Send,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { formatRelativeTime, cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Author {
  id: string
  name: string
  avatarUrl: string | null
  zone: string | null
}

interface CommentData {
  id: string
  postId: string
  userId: string
  text: string
  likesCount: number
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
  userReaction: string | null
}

interface PostDetailData {
  id: string
  userId: string
  content: string | null
  mediaUrls: string[]
  location: string | null
  privacy: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  isEdited: boolean
  createdAt: string
  updatedAt: string
  userReaction: string | null
  user: Author
  comments: CommentData[]
}

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
  { type: "haha", emoji: "😂", label: "Haha" },
]

const REACTION_LABELS: Record<string, string> = {
  like: "👍 Like",
  love: "❤️ Love",
  wow: "😮 Wow",
  sad: "😢 Sad",
  angry: "😠 Angry",
  haha: "😂 Haha",
}

const avatarColors = [
  "bg-red-100 text-red-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<PostDetailData | null>(null)
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)
  const [likesCount, setLikesCount] = useState(0)
  const [sharesCount, setSharesCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMoreComments, setLoadingMoreComments] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data)
        setReaction(data.userReaction)
        setLikesCount(data.likesCount)
        setSharesCount(data.sharesCount)
        if (data.comments) {
          setComments(data.comments)
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [postId])

  const fetchComments = useCallback(async (cursor?: string | null) => {
    try {
      const params = new URLSearchParams()
      if (cursor) params.set("cursor", cursor)
      const res = await fetch(`/api/posts/${postId}/comments?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (cursor) {
          setComments((prev) => [...prev, ...data.comments])
        } else {
          setComments(data.comments)
        }
        setNextCursor(data.nextCursor)
      }
    } catch {
      // silent
    }
  }, [postId])

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [fetchPost, fetchComments])

  const handleReact = async (type: string) => {
    setShowReactionPicker(false)
    try {
      const res = await fetch(`/api/posts/${post!.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        const data = await res.json()
        setReaction(data.liked ? data.type : null)
        setLikesCount(data.count)
      }
    } catch {
      // silent
    }
  }

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/posts/${post!.id}/share`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setSharesCount(data.sharesCount)
      }
    } catch {
      // silent
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/posts/${post!.id}/save`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
      }
    } catch {
      // silent
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || submittingComment) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText.trim() }),
      })
      if (res.ok) {
        const comment = await res.json()
        setComments((prev) => [comment, ...prev])
        setCommentText("")
        setPost((prev) =>
          prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev
        )
      }
    } catch {
      // silent
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleCommentReaction = async (commentId: string, type: string) => {
    try {
      const res = await fetch(`/api/posts/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        const data = await res.json()
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, userReaction: data.liked ? data.type : null, likesCount: data.count }
              : c
          )
        )
      }
    } catch {
      // silent
    }
  }

  const loadMoreComments = async () => {
    if (!nextCursor || loadingMoreComments) return
    setLoadingMoreComments(true)
    await fetchComments(nextCursor)
    setLoadingMoreComments(false)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-24 mb-6" />
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-500">Post not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const mediaUrls: string[] = Array.isArray(post.mediaUrls) ? post.mediaUrls : []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <Link href={`/profile?id=${post.user.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user.avatarUrl || undefined} />
                <AvatarFallback className={getAvatarColor(post.user.name)}>
                  {post.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile?id=${post.user.id}`} className="font-semibold text-sm hover:underline">
                {post.user.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{formatRelativeTime(post.createdAt)}</span>
                {post.isEdited && <span>(edited)</span>}
                {post.user.zone && (
                  <>
                    <span>·</span>
                    <span>{post.user.zone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {post.content && (
            <p className="text-sm text-zinc-800 whitespace-pre-wrap mb-3">
              {post.content}
            </p>
          )}

          {mediaUrls.length > 0 && (
            <div className={cn(
              "mb-3 rounded-xl overflow-hidden",
              mediaUrls.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-1"
            )}>
              {mediaUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Post image ${i + 1}`}
                  className={cn(
                    "w-full object-cover",
                    mediaUrls.length === 1 ? "max-h-96" : "aspect-square"
                  )}
                />
              ))}
            </div>
          )}

          {post.location && (
            <div className="flex items-center gap-1 text-xs text-zinc-500 mb-3">
              <MapPin className="h-3 w-3" />
              <span>{post.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-500 mb-3 pt-1">
            {likesCount > 0 && <span>{likesCount} reaction{likesCount !== 1 ? "s" : ""}</span>}
            <span className="ml-auto">
              {post.commentsCount > 0 && `${post.commentsCount} comment${post.commentsCount !== 1 ? "s" : ""}`}
              {post.commentsCount > 0 && sharesCount > 0 && " · "}
              {sharesCount > 0 && `${sharesCount} share${sharesCount !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="flex items-center border-t border-zinc-100 pt-1">
            <div
              className="relative flex-1"
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-center gap-1.5 text-xs h-9",
                  reaction ? "text-emerald-700 font-medium" : "text-zinc-600"
                )}
                onClick={() => handleReact(reaction || "like")}
              >
                {reaction ? (
                  <span>{REACTION_LABELS[reaction]}</span>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    <span>Like</span>
                  </>
                )}
              </Button>
              {showReactionPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-full border border-zinc-200 shadow-lg px-2 py-1.5 flex gap-1">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.type}
                      className="text-xl hover:scale-125 transition-transform p-1"
                      title={r.label}
                      onClick={() => handleReact(r.type)}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-center gap-1.5 text-xs h-9 text-zinc-600"
              onClick={() => commentInputRef.current?.focus()}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-center gap-1.5 text-xs h-9 text-zinc-600"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "justify-center gap-1.5 text-xs h-9",
                saved ? "text-emerald-700" : "text-zinc-600"
              )}
              onClick={handleSave}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            ref={commentInputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleComment())}
            className="flex-1"
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={handleComment}
            disabled={!commentText.trim() || submittingComment}
          >
            {submittingComment ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Link href={`/profile?id=${comment.user.id}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatarUrl || undefined} />
                    <AvatarFallback className={getAvatarColor(comment.user.name)}>
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="bg-zinc-50 rounded-xl px-3 py-2">
                    <Link href={`/profile?id=${comment.user.id}`} className="font-semibold text-xs hover:underline">
                      {comment.user.name}
                    </Link>
                    <p className="text-sm text-zinc-800 mt-0.5">{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 px-1">
                    <span className="text-[11px] text-zinc-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                    <div className="relative group">
                      <button
                        className={cn(
                          "text-[11px] font-medium hover:underline",
                          comment.userReaction ? "text-emerald-700" : "text-zinc-500"
                        )}
                        onClick={() => handleCommentReaction(comment.id, comment.userReaction || "like")}
                      >
                        {comment.userReaction
                          ? REACTIONS.find((r) => r.type === comment.userReaction)?.emoji || "Like"
                          : "Like"}
                      </button>
                    </div>
                    {comment.likesCount > 0 && (
                      <span className="text-[11px] text-zinc-400">
                        {comment.likesCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {nextCursor && (
          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreComments}
              disabled={loadingMoreComments}
            >
              {loadingMoreComments ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Load more comments
            </Button>
          </div>
        )}

        {comments.length === 0 && (
          <p className="text-center text-zinc-400 text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}
