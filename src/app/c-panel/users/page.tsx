"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Shield, ArrowLeft, Search, Trash2, CheckCircle, XCircle, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

interface Profile {
  id: string
  name: string
  phone: string
  role: string
  isVerified: boolean
  reputationScore: number
  reputationPoints: number
  zone: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
    variant: "destructive" | "default"
  }>({ open: false, title: "", description: "", action: () => {}, variant: "default" })

  const [roleMenu, setRoleMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    if (Array.isArray(data)) setProfiles(data)
    setLoading(false)
  }

  const filtered = profiles.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.zone?.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleVerify = async (user: Profile) => {
    setUpdating(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !user.isVerified }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }))
        alert(`Error: ${err.error || "Failed to update user"}`)
      } else {
        setProfiles((prev) =>
          prev.map((p) => (p.id === user.id ? { ...p, isVerified: !p.isVerified } : p))
        )
      }
    } finally {
      setUpdating(null)
    }
  }

  const handleChangeRole = async (user: Profile, newRole: string) => {
    setRoleMenu(null)
    setUpdating(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }))
        alert(`Error: ${err.error || "Failed to update role"}`)
      } else {
        setProfiles((prev) =>
          prev.map((p) => (p.id === user.id ? { ...p, role: newRole } : p))
        )
      }
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteUser = (user: Profile) => {
    setConfirmDialog({
      open: true,
      title: "Delete User",
      description: `Permanently delete ${user.name}? This action cannot be undone.`,
      variant: "destructive",
      action: async () => {
        setUpdating(user.id)
        try {
          await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
          setProfiles((prev) => prev.filter((p) => p.id !== user.id))
        } finally {
          setUpdating(null)
        }
      },
    })
  }

  const roleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "business": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-red-500" />
            <h1 className="text-xl font-bold">User Management</h1>
            <Badge variant="outline" className="text-zinc-500">{profiles.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-500 text-sm">No users found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400">
                    {p.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.name}</p>
                    {p.isVerified && (
                      <Badge variant="default" className="h-5 text-[10px] bg-emerald-600">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span>{p.phone}</span>
                    {p.zone && <span>· {p.zone}</span>}
                    <span className="text-zinc-700">Score: {p.reputationScore}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {updating === p.id ? (
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs px-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <button
                          onClick={() => setRoleMenu(roleMenu === p.id ? null : p.id)}
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${roleColor(p.role)}`}
                        >
                          {p.role} <ChevronDown className="h-3 w-3" />
                        </button>
                        {roleMenu === p.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setRoleMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl py-1">
                              {["resident", "business", "admin"].map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleChangeRole(p, role)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 capitalize ${p.role === role ? "text-emerald-400" : "text-zinc-300"}`}
                                >
                                  {role === p.role ? "✓ " : ""}{role}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleVerify(p)}
                        className="rounded-lg border border-zinc-800 p-1.5 hover:bg-zinc-800 transition-colors"
                        title={p.isVerified ? "Unverify" : "Verify"}
                      >
                        {p.isVerified ? (
                          <XCircle className="h-4 w-4 text-amber-400" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(p)}
                        className="rounded-lg border border-zinc-800 p-1.5 hover:bg-red-900/30 hover:border-red-900/50 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">{confirmDialog.description}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog.variant === "destructive" ? "destructive" : "default"}
              onClick={() => { confirmDialog.action(); setConfirmDialog((d) => ({ ...d, open: false })) }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
