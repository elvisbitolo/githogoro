"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Heart, Calendar, MapPin, DollarSign, MessageCircle } from "lucide-react"
import { formatRelativeTime, formatDate } from "@/lib/utils"

interface Condolence {
  id: string
  message: string
  amount: number | null
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
}

interface Obituary {
  id: string
  name: string
  description: string | null
  funeralDate: string | null
  funeralLocation: string | null
  fundGoal: number | null
  fundRaised: number
  photo: string | null
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
  condolences: Condolence[]
}

export default function ObituariesPage() {
  const [obituaries, setObituaries] = useState<Obituary[]>([])
  const [loading, setLoading] = useState(true)
  const [condoling, setCondoling] = useState<string | null>(null)
  const [condolenceMsg, setCondolenceMsg] = useState("")
  const [condolenceAmount, setCondolenceAmount] = useState("")
  const [openCondolence, setOpenCondolence] = useState<string | null>(null)

  const fetchObituaries = useCallback(async () => {
    try {
      const res = await fetch("/api/obituaries")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setObituaries(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchObituaries() }, [fetchObituaries])

  const handleCondolence = async (obituaryId: string) => {
    if (!condolenceMsg.trim()) return
    setCondoling(obituaryId)
    try {
      const res = await fetch("/api/obituaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obituaryId, message: condolenceMsg.trim(), amount: condolenceAmount ? Number(condolenceAmount) : null }),
      })
      if (res.ok) {
        setCondolenceMsg("")
        setCondolenceAmount("")
        setOpenCondolence(null)
        fetchObituaries()
      }
    } finally {
      setCondoling(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Obituary Board</h1>
          <p className="text-zinc-500 text-sm mt-1">Honor and remember our departed loved ones</p>
        </div>
        <Link href="/obituaries/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Post Obituary
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-40" /></Card>
          ))}
        </div>
      ) : obituaries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No obituaries posted</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {obituaries.map((obit) => (
            <Card key={obit.id} className="border-zinc-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {obit.photo && (
                    <img src={obit.photo} alt={obit.name} className="h-20 w-20 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">{obit.name}</h3>
                    {obit.description && <p className="text-sm text-zinc-600 mt-1">{obit.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-500">
                      {obit.funeralDate && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(obit.funeralDate)}</span>
                      )}
                      {obit.funeralLocation && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{obit.funeralLocation}</span>
                      )}
                      {obit.fundGoal && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1">
                          <DollarSign className="h-3 w-3" />KES {obit.fundRaised} / {obit.fundGoal}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2">Posted by {obit.user.name} &middot; {formatRelativeTime(obit.createdAt)}</p>

                    <div className="mt-4">
                      <button
                        onClick={() => setOpenCondolence(openCondolence === obit.id ? null : obit.id)}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-600 transition-colors"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {obit.condolences.length} condolence{obit.condolences.length !== 1 ? "s" : ""}
                      </button>

                      {openCondolence === obit.id && (
                        <div className="mt-3 space-y-3">
                          {obit.condolences.length > 0 && (
                            <div className="space-y-2">
                              {obit.condolences.map((c) => (
                                <div key={c.id} className="bg-zinc-50 rounded-lg p-3 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-zinc-700">{c.user.name}</span>
                                    <span className="text-[10px] text-zinc-400">{formatRelativeTime(c.createdAt)}</span>
                                  </div>
                                  <p className="text-zinc-600 mt-1">{c.message}</p>
                                  {c.amount !== null && (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] mt-1">KES {c.amount}</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Write a condolence..."
                              value={condolenceMsg}
                              onChange={(e) => setCondolenceMsg(e.target.value)}
                              className="text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCondolence(obit.id)
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={condolenceAmount}
                              onChange={(e) => setCondolenceAmount(e.target.value)}
                              className="w-24 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleCondolence(obit.id)}
                              disabled={condoling === obit.id || !condolenceMsg.trim()}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
