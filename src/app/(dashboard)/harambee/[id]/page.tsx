"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Heart, Users, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime } from "@/lib/utils"

interface Donation {
  id: string
  amount: number
  message: string | null
  isAnonymous: boolean
  createdAt: string
  donor: { id: string; name: string; avatarUrl: string | null }
}

interface Campaign {
  id: string
  title: string
  description: string | null
  goalAmount: number
  raisedAmount: number
  status: string
  category: string
  isVerified: boolean
  endsAt: string | null
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null; phone: string }
  donations: Donation[]
}

export default function HarambeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [donateDialogOpen, setDonateDialogOpen] = useState(false)
  const [donateAmount, setDonateAmount] = useState("")
  const [donateMessage, setDonateMessage] = useState("")
  const [donateAnonymous, setDonateAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [donateError, setDonateError] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/harambee/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setCampaign(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleDonate = useCallback(async () => {
    if (!campaign) return
    setSubmitting(true)
    setDonateError("")

    const res = await fetch(`/api/harambee/${campaign.id}/donate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(donateAmount),
        message: donateMessage || null,
        isAnonymous: donateAnonymous,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setDonateError(data.error || "Failed to donate")
      setSubmitting(false)
      return
    }

    setCampaign((prev) =>
      prev
        ? {
            ...prev,
            raisedAmount: prev.raisedAmount + parseFloat(donateAmount),
            donations: [
              {
                id: crypto.randomUUID(),
                amount: parseFloat(donateAmount),
                message: donateMessage || null,
                isAnonymous: donateAnonymous,
                createdAt: new Date().toISOString(),
                donor: { id: userId || "", name: donateAnonymous ? "Anonymous" : "You", avatarUrl: null },
              },
              ...prev.donations,
            ],
          }
        : prev
    )

    setDonateDialogOpen(false)
    setDonateAmount("")
    setDonateMessage("")
    setDonateAnonymous(false)
    setSubmitting(false)
  }, [campaign, donateAmount, donateMessage, donateAnonymous, userId])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-100 rounded w-24" />
          <div className="h-48 bg-zinc-100 rounded-2xl" />
          <div className="h-6 bg-zinc-100 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link href="/harambee" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Harambee
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Campaign not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)
  const isCreator = userId === campaign.creator.id
  const donateCount = campaign.donations.length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link href="/harambee" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Harambee
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          {campaign.isVerified && (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          )}
        </div>
        <p className="text-sm text-zinc-500">
          by {campaign.creator.name} &middot; {formatRelativeTime(campaign.createdAt)}
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-emerald-700">
              Ksh {campaign.raisedAmount.toLocaleString()}
            </p>
            <p className="text-sm text-zinc-500">
              raised of Ksh {campaign.goalAmount.toLocaleString()} goal
            </p>
          </div>
          <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-500">{progress.toFixed(0)}%</span>
            <span className="text-xs text-zinc-500">{donateCount} donors</span>
          </div>
        </CardContent>
      </Card>

      {campaign.description && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
              {campaign.description}
            </p>
          </CardContent>
        </Card>
      )}

      {!isCreator && campaign.status === "active" && (
        <Dialog open={donateDialogOpen} onOpenChange={setDonateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 bg-emerald-700 hover:bg-emerald-800">
              <Heart className="h-4 w-4 mr-2" />
              Donate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Donate to {campaign.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Amount (Ksh) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Message</label>
                <Input
                  value={donateMessage}
                  onChange={(e) => setDonateMessage(e.target.value)}
                  placeholder="Optional message..."
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={donateAnonymous}
                  onChange={(e) => setDonateAnonymous(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-700">Donate anonymously</span>
              </label>
              {donateError && (
                <p className="text-sm text-red-600">{donateError}</p>
              )}
              <Button onClick={handleDonate} disabled={submitting} className="w-full">
                {submitting ? "Processing..." : "Donate Now"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <h2 className="text-lg font-semibold mb-3">Donors ({donateCount})</h2>
      {campaign.donations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-8 w-8 text-zinc-300 mb-2" />
            <p className="text-sm text-zinc-500">No donations yet. Be the first!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {campaign.donations.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-3 flex items-center gap-3">
                {d.isAnonymous ? (
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-zinc-400 text-xs">?</span>
                  </div>
                ) : d.donor.avatarUrl ? (
                  <img src={d.donor.avatarUrl} alt={d.donor.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-700 font-semibold text-xs">{d.donor.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{d.isAnonymous ? "Anonymous" : d.donor.name}</p>
                    <p className="text-emerald-700 font-semibold text-sm">Ksh {d.amount.toLocaleString()}</p>
                  </div>
                  {d.message && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{d.message}</p>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 flex-shrink-0">{formatRelativeTime(d.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
