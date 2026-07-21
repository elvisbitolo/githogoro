"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  name: string
  avatarUrl: string | null
}

export default function NewLoanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState("")
  const [selectedLender, setSelectedLender] = useState<UserProfile | null>(null)
  const [amount, setAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!search || search.length < 2) {
      setUsers([])
      return
    }
    const timer = setTimeout(() => {
      fetch(`/api/profiles?search=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setUsers(data.slice(0, 10))
        })
        .catch(() => {})
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedLender) {
      setError("Please select a lender")
      return
    }
    setError("")
    setSubmitting(true)

    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lenderId: selectedLender.id,
        amount,
        interestRate: interestRate || null,
        description: description || null,
        dueDate: dueDate || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to request loan.")
      setSubmitting(false)
      return
    }

    router.push("/loans")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/loans"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Loans
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Request a Loan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Lender <span className="text-red-500">*</span>
              </label>
              {selectedLender ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold text-xs">{selectedLender.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium flex-1">{selectedLender.name}</span>
                  <button type="button" onClick={() => setSelectedLender(null)} className="text-xs text-zinc-500 hover:text-zinc-800">Change</button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name..."
                      className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
                    />
                  </div>
                  {users.length > 0 && (
                    <div className="border border-zinc-200 rounded-xl mt-1 max-h-48 overflow-y-auto">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedLender(u)
                            setSearch("")
                            setUsers([])
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-700 font-semibold text-xs">{u.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm">{u.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Amount (Ksh) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Interest Rate (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Reason for the loan..."
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Requesting..." : "Request Loan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
