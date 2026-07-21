"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Clock, CheckCircle, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime } from "@/lib/utils"

interface Contribution {
  id: string
  cycle: number
  amount: number
  isPaid: boolean
  paidAt: string | null
  userId: string
  user: { id: string; name: string }
}

interface Member {
  id: string
  position: number
  hasReceived: boolean
  joinedAt: string
  userId: string
  user: { id: string; name: string; avatarUrl: string | null }
}

interface Group {
  id: string
  name: string
  description: string | null
  contributionAmount: number
  frequency: string
  maxMembers: number
  currentCycle: number
  totalCycles: number
  status: string
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null }
  members: Member[]
  contributions: Contribution[]
}

export default function TontineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [contributing, setContributing] = useState<number | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/tontine/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setGroup(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleJoin = useCallback(async () => {
    if (!group) return
    setJoining(true)
    const res = await fetch(`/api/tontine/${group.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (res.ok) {
      const member = await res.json()
      setGroup((prev) =>
        prev ? { ...prev, members: [...prev.members, member] } : prev
      )
    }
    setJoining(false)
  }, [group])

  const handleContribute = useCallback(
    async (cycle: number) => {
      if (!group) return
      setContributing(cycle)
      const res = await fetch(`/api/tontine/${group.id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle }),
      })

      if (res.ok) {
        const contribution = await res.json()
        setGroup((prev) => {
          if (!prev) return prev
          const existing = prev.contributions.find(
            (c) => c.userId === userId && c.cycle === cycle
          )
          if (existing) {
            return {
              ...prev,
              contributions: prev.contributions.map((c) =>
                c.id === contribution.id ? contribution : c
              ),
            }
          }
          return { ...prev, contributions: [...prev.contributions, contribution] }
        })
      }
      setContributing(null)
    },
    [group, userId]
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-100 rounded w-24" />
          <div className="h-48 bg-zinc-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link href="/tontine" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Tontine
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Group not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isMember = group.members.some((m) => m.userId === userId)
  const myMember = group.members.find((m) => m.userId === userId)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link href="/tontine" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Tontine
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            group.status === "active" ? "bg-emerald-100 text-emerald-700" : group.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
          }`}>
            {group.status}
          </span>
        </div>
        {group.description && <p className="text-sm text-zinc-500">{group.description}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-700">Ksh {group.contributionAmount.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500">Per Contribution</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{group.members.length}/{group.maxMembers}</p>
            <p className="text-[10px] text-zinc-500">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{group.currentCycle}/{group.totalCycles}</p>
            <p className="text-[10px] text-zinc-500">Cycles</p>
          </CardContent>
        </Card>
      </div>

      {!isMember && group.status === "active" && group.members.length < group.maxMembers && (
        <Button onClick={handleJoin} disabled={joining} className="w-full mb-4">
          <UserPlus className="h-4 w-4 mr-2" />
          {joining ? "Joining..." : "Join Group"}
        </Button>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {group.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2">
                <span className="text-xs text-zinc-400 w-6 text-center">#{m.position}</span>
                {m.user.avatarUrl ? (
                  <img src={m.user.avatarUrl} alt={m.user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold text-xs">{m.user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-sm font-medium flex-1">{m.user.name}</span>
                {m.userId === userId && <Badge variant="secondary">You</Badge>}
                {m.hasReceived && <CheckCircle className="h-4 w-4 text-emerald-500" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isMember && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            {group.totalCycles === 0 ? (
              <p className="text-sm text-zinc-500">No cycles configured yet.</p>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: group.totalCycles }).map((_, i) => {
                  const cycle = i + 1
                  const contribution = group.contributions.find(
                    (c) => c.userId === userId && c.cycle === cycle
                  )
                  const isPaid = contribution?.isPaid
                  return (
                    <div key={cycle} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium">Cycle {cycle}</p>
                        <p className="text-xs text-zinc-500">Ksh {group.contributionAmount.toLocaleString()}</p>
                      </div>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle className="h-4 w-4" />
                          Paid
                        </span>
                      ) : cycle <= group.currentCycle + 1 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContribute(cycle)}
                          disabled={contributing === cycle}
                          className="border-emerald-200 text-emerald-700"
                        >
                          {contributing === cycle ? "Processing..." : "Mark Paid"}
                        </Button>
                      ) : (
                        <span className="text-xs text-zinc-400">Upcoming</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
