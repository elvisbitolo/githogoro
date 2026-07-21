"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, ArrowLeft } from "lucide-react"

const CATEGORIES = ["music", "art", "singing", "dance", "comedy", "other"]

export default function NewTalentPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", description: "", category: "music", media_url: "" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title || !form.category) return
    setSaving(true)
    try {
      const res = await fetch("/api/talents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/talents")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-emerald-600" />
          Share Your Talent
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Showcase your skills to the community</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Title *</label>
            <Input placeholder="e.g. Guitar Performance, Portrait Painting" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Category *</label>
            <select
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Describe your talent..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Media URL (photo/video)</label>
            <Input placeholder="Link to a photo or video" value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Sharing..." : "Share Talent"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
