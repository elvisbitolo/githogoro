"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PenLine, ArrowLeft } from "lucide-react"

export default function NewPetitionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", description: "", category: "", target_signatures: "100" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title || !form.description) return
    setSaving(true)
    try {
      const res = await fetch("/api/petitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/petitions")
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
          <PenLine className="h-6 w-6 text-emerald-600" />
          Create a Petition
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Rally your community around a cause</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Petition Title *</label>
            <Input placeholder="e.g. Fix the community water supply" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description *</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Explain why this petition matters and what change you want to see..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Category</label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="environment">Environment</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="safety">Safety</option>
                <option value="governance">Governance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Target Signatures</label>
              <Input type="number" min="1" value={form.target_signatures} onChange={(e) => setForm({ ...form, target_signatures: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Creating..." : "Create Petition"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
