"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Wrench, DollarSign, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Tool {
  id: string
  name: string
  description: string | null
  photo: string | null
  isAvailable: boolean
  deposit: number | null
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTools(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleBorrow = async (id: string) => {
    setBorrowing(id)
    try {
      const res = await fetch(`/api/tools/${id}/borrow`, { method: "POST" })
      if (res.ok) {
        setTools((prev) => prev.filter((t) => t.id !== id))
      }
    } finally {
      setBorrowing(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tool Lending</h1>
          <p className="text-zinc-500 text-sm mt-1">Borrow tools from your neighbors</p>
        </div>
        <Link href="/tools/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Lend a Tool
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-28" /></Card>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No tools available</p>
            <p className="text-sm text-zinc-400 mt-1">Lend your tools to help neighbors</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {tool.photo ? (
                    <img src={tool.photo} alt={tool.name} className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                      <Wrench className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{tool.name}</h3>
                    {tool.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{tool.description}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Available</Badge>
                      {tool.deposit !== null && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <DollarSign className="h-3 w-3" />{tool.deposit} deposit
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{formatRelativeTime(tool.createdAt)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleBorrow(tool.id)}
                        disabled={borrowing === tool.id}
                        className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {borrowing === tool.id ? "..." : "Borrow"}
                      </Button>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">Listed by {tool.user.name}</p>
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
