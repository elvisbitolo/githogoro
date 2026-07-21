"use client"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"

const CATEGORIES = [
  { value: "community", label: "Community" },
  { value: "entertainment", label: "Entertainment" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
]

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("12:00")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("community")
  const [coverPhoto, setCoverPhoto] = useState("")
  const [isFree, setIsFree] = useState(true)
  const [ticketPrice, setTicketPrice] = useState("")
  const [maxAttendees, setMaxAttendees] = useState("")
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await res.json()
      setCoverPhoto(data.url)
    } catch (err: any) {
      setError(err.message || "Failed to upload cover photo")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create an event.")
      setSubmitting(false)
      return
    }

    if (!date || !time) {
      setError("Please select a date and time.")
      setSubmitting(false)
      return
    }

    const dateTime = new Date(`${date}T${time}:00`)

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        date: dateTime.toISOString(),
        location,
        category,
        coverPhoto: coverPhoto || null,
        maxAttendees: maxAttendees || null,
        isFree,
        ticketPrice: isFree ? null : ticketPrice || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to create event.")
      setSubmitting(false)
      return
    }

    router.push("/events")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Event Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Community Cleanup Day"
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Tell people what this event is about..."
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors resize-y min-h-[100px]"
              />
              <p className="text-xs text-zinc-400">{description.length}/500</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Location <span className="text-red-500">*</span>
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g. Githogoro Community Ground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Cover Photo
              </label>
              {coverPhoto ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={coverPhoto}
                    alt="Cover"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverPhoto("")}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-zinc-200 hover:border-emerald-400 transition-colors text-zinc-400 hover:text-emerald-600"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm font-medium">Upload cover photo</span>
                    </div>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-zinc-700">Free Event</label>
              <button
                type="button"
                onClick={() => {
                  setIsFree(!isFree)
                  if (!isFree) setTicketPrice("")
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isFree ? "bg-emerald-600" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isFree ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {!isFree && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Ticket Price (Ksh)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Max Attendees
              </label>
              <Input
                type="number"
                min="1"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
