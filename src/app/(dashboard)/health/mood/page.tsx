"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface MoodCheckin {
  id: string
  mood: number
  note: string | null
  isAnonymous: boolean
  createdAt: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Very Low" },
  { value: 2, emoji: "😟", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
]

export default function MoodPage() {
  const [checkins, setCheckins] = useState<MoodCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    fetch("/api/health/mood")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCheckins(Array.isArray(data) ? data : []))
      .catch(() => setCheckins([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selectedMood) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/health/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood, note: note || null, isAnonymous }),
      })

      if (res.ok) {
        const newCheckin = await res.json()
        setCheckins((prev) => [newCheckin, ...prev])
        setSelectedMood(null)
        setNote("")
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const averageMood =
    checkins.length > 0
      ? (checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length).toFixed(1)
      : "—"

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Mental Health Check-in</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Take a moment to check in with how you&apos;re feeling
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-zinc-900 mb-4">How are you feeling today?</h3>

          <div className="flex justify-center gap-3 mb-6">
            {moodEmojis.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  selectedMood === m.value
                    ? "bg-emerald-50 ring-2 ring-emerald-500 scale-110"
                    : "hover:bg-zinc-50"
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs text-zinc-500">{m.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about how you're feeling (optional)"
                rows={3}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 resize-none"
              />

              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
                />
                Post anonymously
              </label>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Check-in"}
              </Button>

              {submitted && (
                <p className="text-sm text-emerald-600 text-center font-medium">
                  Thank you for checking in!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Community Average Mood</p>
            <p className="text-2xl font-bold text-zinc-900">{averageMood}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Check-ins</p>
            <p className="text-2xl font-bold text-zinc-900">{checkins.length}</p>
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold text-zinc-900 mb-3">Recent Check-ins</h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : checkins.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">No check-ins yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {checkins.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">{moodEmojis[c.mood - 1]?.emoji || "😐"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900">
                      {c.isAnonymous ? "Anonymous" : c.user.name}
                    </p>
                    <span className="text-xs text-zinc-400">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  {c.note && (
                    <p className="text-sm text-zinc-500 mt-1">{c.note}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
