"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wrench, ArrowLeft } from "lucide-react"

export default function NewToolPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", description: "", photo: "", deposit: "" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/tools")
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
          <Wrench className="h-6 w-6 text-emerald-600" />
          Lend a Tool
        </h1>
        <p className="text-zinc-500 text-sm mt-1">List your tools for neighbors to borrow</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Tool Name *</label>
            <Input placeholder="e.g. Drill, Hammer, Wheelbarrow" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Condition, usage instructions, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Deposit (KES)</label>
              <Input type="number" placeholder="Optional" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Photo URL</label>
              <Input placeholder="Link to a photo" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Listing..." : "List Tool"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
