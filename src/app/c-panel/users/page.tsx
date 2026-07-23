"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Shield, ArrowLeft, Search, Trash2, CheckCircle, XCircle, ChevronDown,
  Loader2, Eye, Star, Award, MessageSquare, Briefcase, Calendar,
} from "lucide-react"
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

interface UserActivity {
  id: string
  name: string
  phone: string
  zone: string | null
  bio: string | null
  role: string
  reputationScore: number
  reputationPoints: number
  isVerified: boolean
  createdAt: string
  activity: {
    messages: number
    posts: number
    jobs: number
    businesses: number
    events: number
    harambees: number
    skills: number
  }
  recentMessages: { id: string; text: string | null; createdAt: string; room: { name: string } }[]
  recentPosts: { id: string; content: string | null; createdAt: string; likesCount: number; commentsCount: number }[]
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
  const [inspector, setInspector] = useState<{ open: boolean; data: UserActivity | null; loading: boolean }>({
    open: false, data: null, loading: false,
  })
  const [repDialog, setRepDialog] = useState<{ open: boolean; user: Profile | null; points: string; reason: string }>({
    open: false, user: null, points: "", reason: "",
  })

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

  const handleInspectUser = async (user: Profile) => {
    setInspector({ open: true, data: null, loading: true })
    try {
      const res = await fetch(`/api/admin/users/${user.id}/activity`)
      const data = await res.json()
      setInspector({ open: true, data, loading: false })
    } catch {
      setInspector({ open: true, data: null, loading: false })
    }
  }

  const handleAdjustReputation = async () => {
    if (!repDialog.user || !repDialog.points) return
    const points = parseInt(repDialog.points, 10)
    if (isNaN(points)) return

    setUpdating(repDialog.user.id)
    try {
      const res = await fetch(`/api/admin/users/${repDialog.user.id}/reputation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, reason: repDialog.reason || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === repDialog.user!.id
              ? { ...p, reputationPoints: data.reputationPoints, reputationScore: data.reputationScore }
              : p
          )
        )
        setRepDialog({ open: false, user: null, points: "", reason: "" })
      } else {
        const err = await res.json().catch(() => ({ error: "Failed" }))
        alert(`Error: ${err.error || "Failed to update reputation"}`)
      }
    } finally {
      setUpdating(null)
    }
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
                      <button
                        onClick={() => handleInspectUser(p)}
                        className="rounded-lg border border-zinc-800 p-1.5 hover:bg-zinc-800 transition-colors"
                        title="View activity"
                      >
                        <Eye className="h-4 w-4 text-zinc-400" />
                      </button>

                      <button
                        onClick={() => setRepDialog({ open: true, user: p, points: "", reason: "" })}
                        className="rounded-lg border border-zinc-800 p-1.5 hover:bg-zinc-800 transition-colors"
                        title="Adjust reputation"
                      >
                        <Star className="h-4 w-4 text-amber-400" />
                      </button>

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

      {/* Confirm Dialog */}
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

      {/* User Inspector Dialog */}
      <Dialog open={inspector.open} onOpenChange={(open) => setInspector((s) => ({ ...s, open }))}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-zinc-400" /> User Profile Inspector
            </DialogTitle>
          </DialogHeader>
          {inspector.loading ? (
            <div className="py-8 text-center text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading profile...
            </div>
          ) : inspector.data ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-lg">
                    {inspector.data.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{inspector.data.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Badge variant="outline" className={roleColor(inspector.data.role)}>{inspector.data.role}</Badge>
                    {inspector.data.isVerified && <Badge className="bg-emerald-600 text-[10px]">Verified</Badge>}
                    <span>Score: {inspector.data.reputationScore}</span>
                  </div>
                </div>
              </div>

              {inspector.data.bio && (
                <p className="text-sm text-zinc-400 italic">&quot;{inspector.data.bio}&quot;</p>
              )}

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Messages", value: inspector.data.activity.messages, icon: MessageSquare, color: "text-emerald-400" },
                  { label: "Posts", value: inspector.data.activity.posts, icon: MessageSquare, color: "text-blue-400" },
                  { label: "Jobs", value: inspector.data.activity.jobs, icon: Briefcase, color: "text-amber-400" },
                  { label: "Businesses", value: inspector.data.activity.businesses, icon: Briefcase, color: "text-purple-400" },
                  { label: "Events", value: inspector.data.activity.events, icon: Calendar, color: "text-cyan-400" },
                  { label: "Harambees", value: inspector.data.activity.harambees, icon: Award, color: "text-pink-400" },
                  { label: "Skills", value: inspector.data.activity.skills, icon: Award, color: "text-orange-400" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-zinc-800/50 p-3 text-center">
                    <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-[10px] text-zinc-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {inspector.data.recentPosts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Recent Posts</h4>
                  <div className="space-y-2">
                    {inspector.data.recentPosts.map((post) => (
                      <div key={post.id} className="rounded-lg bg-zinc-800/50 p-3 text-sm">
                        <p className="text-zinc-400 line-clamp-2">{post.content || "[media]"}</p>
                        <div className="flex items-center gap-3 text-xs text-zinc-600 mt-1">
                          <span>{new Date(post.createdAt).toLocaleString()}</span>
                          <span>{post.likesCount} likes</span>
                          <span>{post.commentsCount} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspector.data.recentMessages.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Recent Messages</h4>
                  <div className="space-y-2">
                    {inspector.data.recentMessages.map((msg) => (
                      <div key={msg.id} className="rounded-lg bg-zinc-800/50 p-3 text-sm">
                        <p className="text-zinc-400 line-clamp-2">{msg.text || "[media]"}</p>
                        <div className="flex items-center gap-3 text-xs text-zinc-600 mt-1">
                          <span>in {msg.room.name}</span>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-4">Failed to load profile.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Reputation Dialog */}
      <Dialog open={repDialog.open} onOpenChange={(open) => setRepDialog((d) => ({ ...d, open }))}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" /> Adjust Reputation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Adjusting reputation for <strong className="text-zinc-200">{repDialog.user?.name}</strong>
              <span className="text-zinc-600 ml-1">(current: {repDialog.user?.reputationPoints} pts)</span>
            </p>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Points (positive to add, negative to subtract)</label>
              <Input
                type="number"
                value={repDialog.points}
                onChange={(e) => setRepDialog((d) => ({ ...d, points: e.target.value }))}
                placeholder="e.g. 50 or -20"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Reason (optional)</label>
              <Input
                value={repDialog.reason}
                onChange={(e) => setRepDialog((d) => ({ ...d, reason: e.target.value }))}
                placeholder="e.g. Community contribution award"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRepDialog({ open: false, user: null, points: "", reason: "" })}>
                Cancel
              </Button>
              <Button
                onClick={handleAdjustReputation}
                disabled={!repDialog.points}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
