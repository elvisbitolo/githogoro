"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ImagePlus,
  MapPin,
  Globe,
  Users,
  Lock,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated: (post: PostData) => void
}

const PRIVACY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe, desc: "Anyone can see" },
  { value: "neighbors", label: "Neighbors", icon: Users, desc: "People in your area" },
  { value: "private", label: "Only Me", icon: Lock, desc: "Only you" },
]

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const [content, setContent] = useState("")
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [mediaInput, setMediaInput] = useState("")
  const [location, setLocation] = useState("")
  const [privacy, setPrivacy] = useState("public")
  const [submitting, setSubmitting] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!content.trim() && mediaUrls.length === 0) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || null,
          mediaUrls,
          location: location.trim() || null,
          privacy,
        }),
      })

      if (res.ok) {
        const post = await res.json()
        onPostCreated({
          ...post,
          userReaction: null,
          authorProfile: post.user,
        })
        setContent("")
        setMediaUrls([])
        setLocation("")
        setPrivacy("public")
        setShowLocation(false)
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  const addMediaUrl = () => {
    if (mediaInput.trim() && !mediaUrls.includes(mediaInput.trim())) {
      setMediaUrls((prev) => [...prev, mediaInput.trim()])
      setMediaInput("")
    }
  }

  const removeMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[120px] resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
          />

          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Upload ${i + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              placeholder="Paste image URL and press Add"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMediaUrl())}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addMediaUrl} disabled={!mediaInput.trim()}>
              Add
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            onChange={(e) => {
              const files = e.target.files
              if (!files) return
              Array.from(files).forEach(async (file) => {
                const formData = new FormData()
                formData.append("file", file)
                try {
                  const res = await fetch("/api/upload", { method: "POST", body: formData })
                  if (res.ok) {
                    const data = await res.json()
                    setMediaUrls((prev) => [...prev, data.url])
                  }
                } catch { /* silent */ }
              })
              e.target.value = ""
            }}
          />

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Upload from device
          </Button>

          {showLocation && (
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 mt-2.5 text-zinc-400 shrink-0" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="flex-1"
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLocation(!showLocation)}
              className={cn(showLocation && "text-emerald-700")}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Location
            </Button>

            <div className="flex items-center gap-1 ml-auto">
              {PRIVACY_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <Button
                    key={opt.value}
                    variant={privacy === opt.value ? "default" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setPrivacy(opt.value)}
                    title={opt.desc}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    {opt.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || (!content.trim() && mediaUrls.length === 0)}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
