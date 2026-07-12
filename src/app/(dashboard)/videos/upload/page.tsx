"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Video, Upload } from "lucide-react"
import Link from "next/link"

export default function UploadVideoPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !youtubeUrl.trim()) {
      setError("Title and YouTube URL are required.")
      return
    }

    setSubmitting(true)

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setError("You must be signed in to upload a video.")
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from("videos").insert({
      title: title.trim(),
      description: description.trim() || null,
      url: youtubeUrl.trim(),
      thumbnail_url: thumbnailUrl.trim() || null,
      user_id: user.id,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push("/videos")
    router.refresh()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/videos"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Videos
      </Link>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-emerald-100 p-2.5">
              <Video className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Share a Video</h1>
              <p className="text-sm text-zinc-500">Upload a YouTube link for the community</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's this video about?"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows={3}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-zinc-700 mb-1">
                YouTube URL <span className="text-red-500">*</span>
              </label>
              <Input
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                required
              />
            </div>

            <div>
              <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-zinc-700 mb-1">
                Thumbnail URL
              </label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg (optional)"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              <Upload className="h-4 w-4 mr-1.5" />
              {submitting ? "Sharing..." : "Share Video"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
