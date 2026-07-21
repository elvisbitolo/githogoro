"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewGroupBuyPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [product, setProduct] = useState("")
  const [targetPledge, setTargetPledge] = useState("")
  const [minPledge, setMinPledge] = useState("")
  const [deadline, setDeadline] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const res = await fetch("/api/group-buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        product,
        targetPledge,
        minPledge,
        deadline: deadline || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to create group buy.")
      setSubmitting(false)
      return
    }

    router.push("/group-buy")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/group-buy"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Group Buys
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create Group Buy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Bulk Maize Flour Purchase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Product <span className="text-red-500">*</span>
              </label>
              <Input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
                placeholder="e.g. Maize Flour 2kg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Target Pledge (Ksh) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={targetPledge}
                  onChange={(e) => setTargetPledge(e.target.value)}
                  required
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Min Pledge (Ksh) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={minPledge}
                  onChange={(e) => setMinPledge(e.target.value)}
                  required
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Deadline</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the group buy details..."
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create Group Buy"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
