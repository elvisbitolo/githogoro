"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Users, Plus, Clock, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime, formatDate } from "@/lib/utils"

interface SavingsChallenge {
  id: string
  title: string
  description: string | null
  targetAmount: number
  duration: string
  startDate: string
  endDate: string
  createdAt: string
  members: { id: string; userId: string; savedAmount: number }[]
}

export default function SavingsPage() {
  const supabase = createClient()
  const [challenges, setChallenges] = useState<SavingsChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    fetch("/api/savings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChallenges(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleJoin = useCallback(async (id: string) => {
    setJoiningId(id)
    const res = await fetch(`/api/savings/${id}/join`, {
      method: "POST",
    })
    if (res.ok) {
      const member = await res.json()
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, members: [...c.members, member] } : c
        )
      )
    }
    setJoiningId(null)
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Savings Challenges</h1>
        <Link
          href="/savings/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Challenge
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-48" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No savings challenges</p>
            <p className="text-sm text-zinc-400 mt-1">Create a challenge to start saving together!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {challenges.map((c) => {
            const isMember = c.members.some((m) => m.userId === userId)
            const memberCount = c.members.length
            const totalSaved = c.members.reduce((s, m) => s + m.savedAmount, 0)
            const progress = Math.min((totalSaved / c.targetAmount) * 100, 100)

            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{c.title}</h3>
                    <Target className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  </div>
                  {c.description && (
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{c.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {c.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {memberCount} members
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-emerald-700 font-semibold">Ksh {totalSaved.toLocaleString()}</span>
                      <span className="text-zinc-400">of Ksh {c.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">Ends {formatDate(c.endDate)}</span>
                    {!isMember && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleJoin(c.id)}
                        disabled={joiningId === c.id}
                        className="border-emerald-200 text-emerald-700 h-7 text-xs"
                      >
                        {joiningId === c.id ? "Joining..." : "Join"}
                      </Button>
                    )}
                    {isMember && (
                      <span className="text-[10px] text-emerald-600 font-medium">Joined</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
