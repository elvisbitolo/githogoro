"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, ArrowLeft } from "lucide-react"

export default function NewErrandPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", description: "", pickup_location: "", dropoff_location: "", tip: "", due_date: "" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title || !form.pickup_location) return
    setSaving(true)
    try {
      const res = await fetch("/api/errands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/errands")
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
          <Package className="h-6 w-6 text-emerald-600" />
          Post an Errand
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Need something done? Let your neighbors help</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Title *</label>
            <Input placeholder="e.g. Pick up groceries from the market" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Details about the errand..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Pickup Location *</label>
              <Input placeholder="Where to pick up" value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Drop-off Location</label>
              <Input placeholder="Where to deliver" value={form.dropoff_location} onChange={(e) => setForm({ ...form, dropoff_location: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Tip Amount (KES)</label>
              <Input type="number" placeholder="0" value={form.tip} onChange={(e) => setForm({ ...form, tip: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Due Date</label>
              <Input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Posting..." : "Post Errand"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
