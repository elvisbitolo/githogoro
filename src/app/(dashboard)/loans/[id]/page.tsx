"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime, formatDate } from "@/lib/utils"

interface Loan {
  id: string
  amount: number
  interestRate: number | null
  description: string | null
  status: string
  dueDate: string | null
  repaidAt: string | null
  createdAt: string
  lender: { id: string; name: string; avatarUrl: string | null; phone: string }
  borrower: { id: string; name: string; avatarUrl: string | null; phone: string }
}

const STATUS_INFO: Record<string, { className: string; label: string; icon: React.ElementType }> = {
  pending: { className: "bg-amber-100 text-amber-700", label: "Pending", icon: Clock },
  active: { className: "bg-emerald-100 text-emerald-700", label: "Active", icon: AlertCircle },
  repaid: { className: "bg-blue-100 text-blue-700", label: "Repaid", icon: CheckCircle },
  defaulted: { className: "bg-red-100 text-red-700", label: "Defaulted", icon: AlertCircle },
}

export default function LoanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/loans/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setLoan(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleApprove = useCallback(async () => {
    if (!loan) return
    setActionLoading(true)
    const res = await fetch(`/api/loans/${loan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    })
    if (res.ok) {
      setLoan((prev) => (prev ? { ...prev, status: "active" } : prev))
    }
    setActionLoading(false)
  }, [loan])

  const handleMarkRepaid = useCallback(async () => {
    if (!loan) return
    setActionLoading(true)
    const res = await fetch(`/api/loans/${loan.id}/repay`, {
      method: "POST",
    })
    if (res.ok) {
      const updated = await res.json()
      setLoan(updated)
    }
    setActionLoading(false)
  }, [loan])

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

  if (!loan) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link href="/loans" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Loans
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Loan not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[loan.status] || STATUS_INFO.pending
  const StatusIcon = statusInfo.icon
  const isLender = userId === loan.lender.id
  const isBorrower = userId === loan.borrower.id

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link href="/loans" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Loans
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">Ksh {loan.amount.toLocaleString()}</h1>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.className}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusInfo.label}
          </span>
        </div>
        <p className="text-sm text-zinc-500">{formatRelativeTime(loan.createdAt)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Lender</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-700 font-semibold text-xs">{loan.lender.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{loan.lender.name}</p>
                {loan.lender.phone && <p className="text-[10px] text-zinc-400">{loan.lender.phone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Borrower</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-xs">{loan.borrower.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{loan.borrower.name}</p>
                {loan.borrower.phone && <p className="text-[10px] text-zinc-400">{loan.borrower.phone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Amount</span>
            <span className="font-semibold">Ksh {loan.amount.toLocaleString()}</span>
          </div>
          {loan.interestRate && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Interest Rate</span>
              <span>{loan.interestRate}%</span>
            </div>
          )}
          {loan.dueDate && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Due Date</span>
              <span>{formatDate(loan.dueDate)}</span>
            </div>
          )}
          {loan.repaidAt && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Repaid At</span>
              <span>{formatDate(loan.repaidAt)}</span>
            </div>
          )}
          {loan.description && (
            <div className="pt-2 border-t border-zinc-50">
              <p className="text-xs text-zinc-500 mb-1">Description</p>
              <p className="text-sm text-zinc-700">{loan.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {loan.status === "pending" && isLender && (
        <Button onClick={handleApprove} disabled={actionLoading} className="w-full mb-2 bg-emerald-700 hover:bg-emerald-800">
          {actionLoading ? "Processing..." : "Approve Loan"}
        </Button>
      )}

      {loan.status === "active" && isLender && (
        <Button onClick={handleMarkRepaid} disabled={actionLoading} className="w-full bg-blue-600 hover:bg-blue-700">
          {actionLoading ? "Processing..." : "Mark as Repaid"}
        </Button>
      )}
    </div>
  )
}
