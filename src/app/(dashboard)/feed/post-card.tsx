"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react"
import { formatRelativeTime, cn } from "@/lib/utils"

interface PostAuthor {
  id: string
  name: string
  avatarUrl: string | null
  zone: string | null
}

interface PostData {
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
  authorProfile: PostAuthor
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

interface PostCardProps {
  post: PostData
  onDelete?: (id: string) => void
  onUpdate?: (post: PostData) => void
}

export function PostCard({ post, onDelete, onUpdate }: PostCardProps) {
  const router = useRouter()
  const [reaction, setReaction] = useState<string | null>(post.userReaction)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [sharesCount, setSharesCount] = useState(post.sharesCount)
  const [saved, setSaved] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [reacting, setReacting] = useState(false)

  const mediaUrls: string[] = Array.isArray(post.mediaUrls) ? post.mediaUrls : []

  const handleReact = async (type: string) => {
    if (reacting) return
    setReacting(true)
    setShowReactionPicker(false)
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
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
    } finally {
      setReacting(false)
    }
  }

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/share`, {
        method: "POST",
      })
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
      const res = await fetch(`/api/posts/${post.id}/save`, {
        method: "POST",
      })
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
      }
    } catch {
      // silent
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" })
      if (res.ok) {
        onDelete?.(post.id)
      }
    } catch {
      // silent
    }
    setShowMenu(false)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile?id=${post.authorProfile.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorProfile.avatarUrl || undefined} />
              <AvatarFallback className={getAvatarColor(post.authorProfile.name)}>
                {post.authorProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/profile?id=${post.authorProfile.id}`} className="font-semibold text-sm hover:underline truncate">
                {post.authorProfile.name}
              </Link>
              {post.isEdited && (
                <span className="text-xs text-zinc-400">(edited)</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{formatRelativeTime(post.createdAt)}</span>
              {post.authorProfile.zone && (
                <>
                  <span>·</span>
                  <span>{post.authorProfile.zone}</span>
                </>
              )}
            </div>
          </div>

          {post.userId && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 z-50 w-40 bg-white rounded-xl border border-zinc-200 shadow-lg py-1">
                    <Link
                      href={`/feed/post-detail/${post.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                      onClick={() => setShowMenu(false)}
                    >
                      View post
                    </Link>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 w-full text-left"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/feed/post-detail/${post.id}`
                        )
                        setShowMenu(false)
                      }}
                    >
                      Copy link
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
            {mediaUrls.slice(0, 4).map((url, i) => (
              <div key={i} className="relative bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Post image ${i + 1}`}
                  className={cn(
                    "w-full object-cover",
                    mediaUrls.length === 1 ? "max-h-96" : "aspect-square"
                  )}
                />
                {i === 3 && mediaUrls.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      +{mediaUrls.length - 4}
                    </span>
                  </div>
                )}
              </div>
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
            {(post.commentsCount > 0 || sharesCount > 0) && (
              <>
                {post.commentsCount > 0 && `${post.commentsCount} comment${post.commentsCount !== 1 ? "s" : ""}`}
                {post.commentsCount > 0 && sharesCount > 0 && " · "}
                {sharesCount > 0 && `${sharesCount} share${sharesCount !== 1 ? "s" : ""}`}
              </>
            )}
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
                "flex-1 w-full justify-center gap-1.5 text-xs h-9",
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
            onClick={() => router.push(`/feed/post-detail/${post.id}`)}
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
  )
}
