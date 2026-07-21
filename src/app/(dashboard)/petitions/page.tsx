"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, PenLine, Users, CheckCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Signature {
  id: string
  message: string | null
  createdAt: string
  user: { id: string; name: string }
}

interface Petition {
  id: string
  title: string
  description: string
  category: string | null
  targetSignatures: number
  currentSignatures: number
  status: string
  createdAt: string
  creator: { id: string; name: string; avatarUrl: string | null }
  signatures: Signature[]
}

export default function PetitionsPage() {
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<string | null>(null)
  const [signMsg, setSignMsg] = useState("")
  const [openSign, setOpenSign] = useState<string | null>(null)

  const fetchPetitions = useCallback(async () => {
    try {
      const res = await fetch("/api/petitions")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setPetitions(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPetitions() }, [fetchPetitions])

  const handleSign = async (petitionId: string) => {
    setSigning(petitionId)
    try {
      const res = await fetch(`/api/petitions/${petitionId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: signMsg.trim() || null }),
      })
      if (res.ok) {
        setSignMsg("")
        setOpenSign(null)
        fetchPetitions()
      }
    } finally {
      setSigning(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Petitions</h1>
          <p className="text-zinc-500 text-sm mt-1">Stand up for causes that matter</p>
        </div>
        <Link href="/petitions/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Create Petition
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-32" /></Card>
          ))}
        </div>
      ) : petitions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PenLine className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No petitions yet</p>
            <p className="text-sm text-zinc-400 mt-1">Start a petition for a cause you believe in</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {petitions.map((petition) => {
            const progress = Math.min((petition.currentSignatures / petition.targetSignatures) * 100, 100)
            return (
              <Card key={petition.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{petition.title}</h3>
                    <Badge className={`${petition.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-600"} text-[10px]`}>{petition.status}</Badge>
                    {petition.category && (
                      <Badge variant="secondary" className="text-[10px]">{petition.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 mt-2">{petition.description}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span>{petition.currentSignatures} / {petition.targetSignatures} signatures</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-zinc-400">Created by {petition.creator.name} &middot; {formatRelativeTime(petition.createdAt)}</p>
                    {petition.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenSign(openSign === petition.id ? null : petition.id)}
                        className="gap-1 text-xs"
                      >
                        <PenLine className="h-3 w-3" />
                        Sign ({petition.signatures.length})
                      </Button>
                    )}
                  </div>

                  {openSign === petition.id && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      {petition.signatures.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {petition.signatures.slice(0, 5).map((s) => (
                            <div key={s.id} className="text-xs text-zinc-500">
                              <span className="font-medium">{s.user.name}</span>
                              {s.message && <span> — {s.message}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Your message (optional)"
                          value={signMsg}
                          onChange={(e) => setSignMsg(e.target.value)}
                          className="text-sm"
                          onKeyDown={(e) => { if (e.key === "Enter") handleSign(petition.id) }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSign(petition.id)}
                          disabled={signing === petition.id}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {signing === petition.id ? "..." : "Sign"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
