"use client"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, Plus, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

interface PollOption {
  label: string
  count: number
  percentage: number
}

interface Poll {
  id: string
  question: string
  options: string[]
  totalVotes: number
  counts: number[]
  isExpired: boolean
  endsAt: string | null
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null }
  userVote?: number
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [votingPoll, setVotingPoll] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch("/api/polls")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setPolls(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPolls()
  }, [fetchPolls])

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!userId || votingPoll) return
    setVotingPoll(pollId)
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: optionIndex }),
      })
      if (res.ok) {
        fetchPolls()
      }
    } finally {
      setVotingPoll(null)
    }
  }

  const getOptionPercentage = (poll: Poll, index: number) => {
    if (poll.totalVotes === 0) return 0
    return Math.round((poll.counts[index] / poll.totalVotes) * 100)
  }

  const activePolls = polls.filter((p) => !p.isExpired)
  const closedPolls = polls.filter((p) => p.isExpired)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community Polls</h1>
        <Link
          href="/polls/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Poll
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-zinc-100 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : polls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No polls yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Create the first community poll!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activePolls.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Active ({activePolls.length})
              </h2>
              <div className="space-y-4">
                {activePolls.map((poll) => (
                  <Card key={poll.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base">{poll.question}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px]">
                                  {poll.creator.name?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              {poll.creator.name}
                            </span>
                            <span>{formatRelativeTime(poll.createdAt)}</span>
                            {poll.endsAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Ends {formatRelativeTime(poll.endsAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="info" className="text-[10px] shrink-0">
                          {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {poll.options.map((option, i) => {
                          const pct = getOptionPercentage(poll, i)
                          const isSelected = poll.userVote === i
                          return (
                            <button
                              key={i}
                              onClick={() => handleVote(poll.id, i)}
                              disabled={!!votingPoll}
                              className="w-full relative text-left"
                            >
                              <div className="relative overflow-hidden rounded-xl border border-zinc-200 hover:border-emerald-300 transition-colors">
                                <div
                                  className="absolute inset-0 bg-emerald-50 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                                <div className="relative flex items-center justify-between px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? "border-emerald-600 bg-emerald-600"
                                          : "border-zinc-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <CheckCircle className="h-3 w-3 text-white" />
                                      )}
                                    </div>
                                    <span className="text-sm font-medium text-zinc-800">
                                      {option}
                                    </span>
                                  </div>
                                  <span className="text-xs font-semibold text-zinc-500 tabular-nums">
                                    {pct}%
                                  </span>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {closedPolls.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Closed ({closedPolls.length})
              </h2>
              <div className="space-y-4 opacity-60">
                {closedPolls.map((poll) => (
                  <Card key={poll.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base">{poll.question}</h3>
                          <span className="text-xs text-zinc-400">
                            {formatRelativeTime(poll.createdAt)}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          closed
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {poll.options.map((option, i) => {
                          const pct = getOptionPercentage(poll, i)
                          return (
                            <div key={i} className="relative overflow-hidden rounded-xl border border-zinc-200">
                              <div
                                className="absolute inset-0 bg-zinc-100 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                              <div className="relative flex items-center justify-between px-4 py-3">
                                <span className="text-sm text-zinc-600">{option}</span>
                                <span className="text-xs font-semibold text-zinc-400 tabular-nums">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
