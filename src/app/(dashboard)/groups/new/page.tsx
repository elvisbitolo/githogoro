"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, Users, Check, X } from "lucide-react"
import Link from "next/link"

export default function NewGroupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profiles, setProfiles] = useState<any[]>([])
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState<"members" | "details">("members")

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setLoading(false)
        return
      }

      const res = await fetch("/api/profiles")
      if (cancelled) return
      const data = res.ok ? await res.json() : []
      if (Array.isArray(data)) {
        setProfiles(data.filter((p: any) => p.id !== user.id))
      }
      setLoading(false)
    }

    init()
    return () => { cancelled = true }
  }, [])

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    )
  }

  const filtered = profiles.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return p.name?.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q)
  })

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 1) return
    setCreating(true)
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDescription.trim() || null,
          memberIds: selectedIds,
        }),
      })
      const data = await res.json()
      if (res.ok && data.id) {
        router.push(`/groups/${data.id}`)
      }
    } catch (e) {
      console.error("Failed to create group:", e)
    } finally {
      setCreating(false)
    }
  }

  const selectedProfiles = profiles.filter((p) => selectedIds.includes(p.id))

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="px-4 h-14 border-b border-zinc-100 bg-white flex items-center gap-3 shrink-0">
        <Link
          href="/groups"
          className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">New Group</h1>
          {step === "members" && (
            <p className="text-xs text-zinc-400">{selectedIds.length} member{selectedIds.length !== 1 ? "s" : ""} selected</p>
          )}
        </div>
        {step === "details" && (
          <Button size="sm" onClick={handleCreate} disabled={!groupName.trim() || creating}>
            {creating ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        )}
      </div>

      {step === "members" ? (
        <>
          <div className="px-4 py-3 border-b border-zinc-100 bg-white shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search people to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
              />
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="px-4 py-2 border-b border-zinc-100 bg-emerald-50 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {selectedProfiles.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5"
                  >
                    {p.name}
                    <button
                      onClick={() => toggleMember(p.id)}
                      className="h-4 w-4 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-zinc-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-zinc-200 rounded" />
                      <div className="h-3 w-24 bg-zinc-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Users className="h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-500 font-medium">
                  {searchQuery ? "No people found" : "No community members yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {filtered.map((profile) => {
                  const isSelected = selectedIds.includes(profile.id)
                  return (
                    <button
                      key={profile.id}
                      onClick={() => toggleMember(profile.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                        isSelected ? "bg-emerald-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback className={`text-sm font-medium ${isSelected ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                          {(profile.name || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-medium truncate">{profile.name}</h3>
                          {profile.isVerified && (
                            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100">
                              <svg className="h-2.5 w-2.5 text-emerald-700" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 truncate">
                          {profile.phone}
                          {profile.zone ? ` · ${profile.zone}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600"
                              : "border-zinc-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-zinc-100 bg-white shrink-0">
            <Button
              onClick={() => setStep("details")}
              disabled={selectedIds.length < 1}
              className="w-full"
            >
              Next ({selectedIds.length} member{selectedIds.length !== 1 ? "s" : ""})
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Neighbourhood Watch"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
              />
              <p className="text-xs text-zinc-400 mt-1">{groupName.length}/50</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Description <span className="text-zinc-400">(optional)</span>
              </label>
              <textarea
                placeholder="What is this group about?"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={3}
                maxLength={200}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors resize-none"
              />
              <p className="text-xs text-zinc-400 mt-1">{groupDescription.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Members ({selectedIds.length + 1}, including you)
              </label>
              <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                {selectedProfiles.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-zinc-100 text-zinc-600">
                        {(p.name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={!groupName.trim() || creating}
              className="w-full"
              size="lg"
            >
              {creating ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
