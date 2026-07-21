"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, ArrowLeft } from "lucide-react"

export default function NewMemoryPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", description: "", photo_url: "", year: "" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title || !form.photo_url) return
    setSaving(true)
    try {
      const res = await fetch("/api/photo-memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/memories")
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
          <Camera className="h-6 w-6 text-emerald-600" />
          Share a Memory
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Share a throwback photo with the community</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Title *</label>
            <Input placeholder="e.g. Community Day 2020, Market Day" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Tell the story behind this photo..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Photo URL *</label>
            <Input placeholder="Link to the photo" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Year</label>
            <Input type="number" placeholder="e.g. 2020" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Sharing..." : "Share Memory"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
