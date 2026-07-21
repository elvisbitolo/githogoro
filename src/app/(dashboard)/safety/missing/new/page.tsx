"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function NewMissingPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", description: "", category: "person", photo: "", location: "", contact_phone: "" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.contact_phone || !form.category) return
    setSaving(true)
    try {
      const res = await fetch("/api/safety/missing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          category: form.category,
          photo: form.photo || null,
          location: form.location || null,
          contactPhone: form.contact_phone,
        }),
      })
      if (res.ok) router.push("/safety/missing")
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
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Report Missing Person
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Fill in the details to alert the community</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Name *</label>
            <Input placeholder="Full name of missing person" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Category *</label>
            <select
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="person">Person</option>
              <option value="child">Child</option>
              <option value="elderly">Elderly</option>
              <option value="pet">Pet</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Physical description, last seen wearing, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Last Seen Location</label>
            <Input placeholder="Where was the person last seen?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Photo URL</label>
            <Input placeholder="Link to a photo (optional)" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Contact Phone *</label>
            <Input placeholder="Phone number for tips" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-700">
            {saving ? "Submitting..." : "Submit Missing Person Report"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
