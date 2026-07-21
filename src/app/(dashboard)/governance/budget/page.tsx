"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"

interface BudgetEntry {
  id: string
  title: string
  type: string
  amount: number
  description: string | null
  date: string
  createdAt: string
  user: { id: string; name: string }
}

export default function BudgetPage() {
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== "all") params.set("type", filter)

    fetch(`/api/governance/budget?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [filter])

  const totalIncome = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0)
  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Budget Tracker</h1>
          <p className="text-sm text-zinc-500 mt-1">Community finances</p>
        </div>
        <Link href="/governance/budget/new">
          <Button size="sm">Add Entry</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Income</p>
            <p className="text-lg font-bold text-emerald-600">
              KES {totalIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Expenses</p>
            <p className="text-lg font-bold text-red-600">
              KES {totalExpense.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Balance</p>
            <p className={`text-lg font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              KES {balance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "income", "expense"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === t
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-12">No budget entries yet</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left p-3 text-zinc-500 font-medium">Title</th>
                  <th className="text-left p-3 text-zinc-500 font-medium">Type</th>
                  <th className="text-right p-3 text-zinc-500 font-medium">Amount</th>
                  <th className="text-right p-3 text-zinc-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-50 last:border-0">
                    <td className="p-3">
                      <p className="font-medium text-zinc-900">{entry.title}</p>
                      {entry.description && (
                        <p className="text-xs text-zinc-400 mt-0.5">{entry.description}</p>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={entry.type === "income" ? "default" : "destructive"}>
                        {entry.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <span className={entry.type === "income" ? "text-emerald-600" : "text-red-600"}>
                        {entry.type === "income" ? "+" : "-"} KES {entry.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right text-zinc-400 text-xs">
                      {formatRelativeTime(entry.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
