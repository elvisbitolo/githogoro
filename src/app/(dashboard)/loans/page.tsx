"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime } from "@/lib/utils"

interface Loan {
  id: string
  amount: number
  interestRate: number | null
  description: string | null
  status: string
  dueDate: string | null
  repaidAt: string | null
  createdAt: string
  lender?: { id: string; name: string; avatarUrl: string | null }
  borrower?: { id: string; name: string; avatarUrl: string | null }
}

const STATUS_BADGE: Record<string, { className: string; icon: React.ElementType }> = {
  pending: { className: "bg-amber-100 text-amber-700", icon: Clock },
  active: { className: "bg-emerald-100 text-emerald-700", icon: AlertCircle },
  repaid: { className: "bg-blue-100 text-blue-700", icon: CheckCircle },
  defaulted: { className: "bg-red-100 text-red-700", icon: AlertCircle },
}

export default function LoansPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [given, setGiven] = useState<Loan[]>([])
  const [taken, setTaken] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then((data) => {
        if (data.given) setGiven(data.given)
        if (data.taken) setTaken(data.taken)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function LoanCard({ loan, type }: { loan: Loan; type: "given" | "taken" }) {
    const person = type === "given" ? loan.borrower : loan.lender
    const statusInfo = STATUS_BADGE[loan.status] || STATUS_BADGE.pending
    const StatusIcon = statusInfo.icon

    return (
      <Link href={`/loans/${loan.id}`}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {type === "given" ? (
                  <ArrowUpRight className="h-4 w-4 text-amber-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                )}
                <span className="text-xs text-zinc-500 capitalize">{type === "given" ? "Lent to" : "Borrowed from"}</span>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusInfo.className}`}>
                <StatusIcon className="h-3 w-3" />
                {loan.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {person?.avatarUrl ? (
                <img src={person.avatarUrl} alt={person.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold text-xs">{person?.name?.charAt(0).toUpperCase() || "?"}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{person?.name}</p>
                <p className="text-xs text-zinc-500">{formatRelativeTime(loan.createdAt)}</p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-50">
              <p className="text-lg font-bold text-emerald-700">Ksh {loan.amount.toLocaleString()}</p>
              {loan.interestRate && (
                <p className="text-xs text-zinc-500">Interest: {loan.interestRate}%</p>
              )}
              {loan.dueDate && (
                <p className="text-xs text-zinc-400 mt-0.5">Due: {new Date(loan.dueDate).toLocaleDateString("en-KE")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const totalGiven = given.reduce((s, l) => s + l.amount, 0)
  const totalTaken = taken.reduce((s, l) => s + l.amount, 0)
  const pendingGiven = given.filter((l) => l.status === "pending").length
  const pendingTaken = taken.filter((l) => l.status === "pending").length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Micro-Loans</h1>
        <Link
          href="/loans/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4 mr-1" />
          Request Loan
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">Ksh {totalGiven.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500">Total Lent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">Ksh {totalTaken.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500">Total Borrowed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{pendingGiven}</p>
            <p className="text-[10px] text-zinc-500">Pending (Given)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{pendingTaken}</p>
            <p className="text-[10px] text-zinc-500">Pending (Taken)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="given">
        <TabsList className="mb-4">
          <TabsTrigger value="given">Loans Given ({given.length})</TabsTrigger>
          <TabsTrigger value="taken">Loans Taken ({taken.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="given">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-32" />
              ))}
            </div>
          ) : given.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-500">No loans given yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {given.map((loan) => (
                <LoanCard key={loan.id} loan={loan} type="given" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="taken">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-32" />
              ))}
            </div>
          ) : taken.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-500">No loans taken yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {taken.map((loan) => (
                <LoanCard key={loan.id} loan={loan} type="taken" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
