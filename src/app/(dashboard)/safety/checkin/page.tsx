"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserCheck, CheckCircle } from "lucide-react"

export default function CheckInPage() {
  const [form, setForm] = useState({ childName: "", location: "", status: "safe", message: "" })
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!form.childName || !form.location) return
    setSaving(true)
    try {
      const res = await fetch("/api/safety/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setForm({ childName: "", location: "", status: "safe", message: "" })
        }, 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-emerald-700">Check-In Recorded!</h2>
            <p className="text-emerald-600 mt-2 text-sm">The safety status has been logged</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-emerald-600" />
          Child Check-In
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Log your child&apos;s safety status</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Child&apos;s Name *</label>
            <Input placeholder="Name of the child" value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Location *</label>
            <Input placeholder="Where is the child now?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Status</label>
            <div className="flex gap-2">
              {["safe", "needs pickup", "with guardian", "unknown"].map((s) => (
                <Badge
                  key={s}
                  className={`cursor-pointer text-xs ${form.status === s ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                  onClick={() => setForm({ ...form, status: s })}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Message</label>
            <Input placeholder="Optional note" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Recording..." : "Record Check-In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
