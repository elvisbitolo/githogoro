"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingCart, Users, Plus, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime, formatDate } from "@/lib/utils"

interface GroupBuy {
  id: string
  title: string
  description: string | null
  product: string
  targetPledge: number
  currentPledge: number
  minPledge: number
  deadline: string | null
  isActive: boolean
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null }
  pledges: { id: string }[]
}

export default function GroupBuyPage() {
  const supabase = createClient()
  const [purchases, setPurchases] = useState<GroupBuy[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [pledgeDialog, setPledgeDialog] = useState<string | null>(null)
  const [pledgeAmount, setPledgeAmount] = useState("")
  const [pledgeQuantity, setPledgeQuantity] = useState("1")
  const [pledgeError, setPledgeError] = useState("")
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    fetch("/api/group-buy")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPurchases(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handlePledge = useCallback(async () => {
    if (!pledgeDialog) return
    setPledgeSubmitting(true)
    setPledgeError("")

    const res = await fetch(`/api/group-buy/${pledgeDialog}/pledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(pledgeAmount),
        quantity: parseInt(pledgeQuantity),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setPledgeError(data.error || "Failed to pledge")
      setPledgeSubmitting(false)
      return
    }

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === pledgeDialog
          ? { ...p, currentPledge: p.currentPledge + parseFloat(pledgeAmount) }
          : p
      )
    )
    setPledgeDialog(null)
    setPledgeAmount("")
    setPledgeQuantity("1")
    setPledgeSubmitting(false)
  }, [pledgeDialog, pledgeAmount, pledgeQuantity])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Group Buys</h1>
        <Link
          href="/group-buy/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-48" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No group buys yet</p>
            <p className="text-sm text-zinc-400 mt-1">Start a group buy to save together!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {purchases.map((p) => {
            const progress = Math.min((p.currentPledge / p.targetPledge) * 100, 100)
            const isCreator = userId === p.creator.id
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{p.product}</span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {p.pledges.length} pledges
                    </span>
                    {p.deadline && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(p.deadline)}
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-emerald-700 font-semibold">Ksh {p.currentPledge.toLocaleString()}</span>
                      <span className="text-zinc-400">of Ksh {p.targetPledge.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Min: Ksh {p.minPledge.toLocaleString()}</span>
                    {!isCreator && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPledgeDialog(p.id)
                          setPledgeAmount(p.minPledge.toString())
                        }}
                        className="border-emerald-200 text-emerald-700 h-7 text-xs"
                      >
                        Pledge
                      </Button>
                    )}
                    {isCreator && <span className="text-[10px] text-zinc-400">Your listing</span>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!pledgeDialog} onOpenChange={(open) => { if (!open) setPledgeDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Pledge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Amount (Ksh) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Quantity</label>
              <Input
                type="number"
                min="1"
                value={pledgeQuantity}
                onChange={(e) => setPledgeQuantity(e.target.value)}
              />
            </div>
            {pledgeError && (
              <p className="text-sm text-red-600">{pledgeError}</p>
            )}
            <Button onClick={handlePledge} disabled={pledgeSubmitting} className="w-full">
              {pledgeSubmitting ? "Processing..." : "Confirm Pledge"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
