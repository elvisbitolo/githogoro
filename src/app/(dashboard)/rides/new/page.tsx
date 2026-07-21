"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Car, ArrowLeft } from "lucide-react"

export default function NewRidePage() {
  const router = useRouter()
  const [form, setForm] = useState({ from: "", to: "", departure_time: "", seats: "1", price: "", description: "" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.from || !form.to || !form.departure_time) return
    setSaving(true)
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/rides")
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
          <Car className="h-6 w-6 text-emerald-600" />
          Offer a Ride
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Share your ride and help neighbors get around</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">From *</label>
              <Input placeholder="Starting point" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">To *</label>
              <Input placeholder="Destination" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Departure Time *</label>
            <Input type="datetime-local" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Available Seats</label>
              <Input type="number" min="1" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Price per seat (KES)</label>
              <Input type="number" placeholder="Free" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Any extra details about the ride..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Posting..." : "Offer Ride"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
