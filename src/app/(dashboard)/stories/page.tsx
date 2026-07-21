"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import StoryViewer from "./story-viewer"
import StoryCreator from "./story-creator"

interface StatusUser {
  user: { id: string; name: string; avatarUrl: string | null }
  statuses: {
    id: string
    content: string
    mediaUrl: string | null
    createdAt: string
  }[]
}

export default function StoriesPage() {
  const [statuses, setStatuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [viewerState, setViewerState] = useState<{
    open: boolean
    userIndex: number
  }>({ open: false, userIndex: 0 })

  const supabase = createClient()

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch("/api/statuses")
      if (res.ok) {
        const data = await res.json()
        setStatuses(data)
      }
    } catch (error) {
      console.error("Failed to fetch statuses:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
    fetchStatuses()
  }, [supabase, fetchStatuses])

  const groupedByUser = statuses.reduce<StatusUser[]>((acc, status) => {
    const existing = acc.find((g) => g.user.id === status.user.id)
    if (existing) {
      existing.statuses.push(status)
    } else {
      acc.push({ user: status.user, statuses: [status] })
    }
    return acc
  }, [])

  const ownStatuses = groupedByUser.find((g) => g.user.id === currentUserId)
  const otherStatuses = groupedByUser.filter((g) => g.user.id !== currentUserId)

  const handleStatusCreated = () => {
    setShowCreator(false)
    fetchStatuses()
  }

  const handleDelete = (statusId: string) => {
    setStatuses((prev) => prev.filter((s) => s.id !== statusId))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Stories</h1>
        <p className="text-zinc-500 mt-1">See what your community is sharing</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setShowCreator(true)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="relative h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-dashed border-emerald-400">
              <Plus className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-zinc-600 w-16 text-center truncate">
              {ownStatuses ? "Your Story" : "Add Story"}
            </span>
          </button>

          {ownStatuses && (
            <button
              onClick={() =>
                setViewerState({
                  open: true,
                  userIndex: 0,
                })
              }
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="h-16 w-16 rounded-full p-[3px] bg-gradient-to-br from-emerald-500 to-teal-600">
                <div className="h-full w-full rounded-full overflow-hidden bg-white p-[2px]">
                  <div className="h-full w-full rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                    {ownStatuses.user.avatarUrl ? (
                      <img
                        src={ownStatuses.user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-emerald-700">
                        {(ownStatuses.user.name || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-zinc-600 w-16 text-center truncate">
                Your Story
              </span>
            </button>
          )}

          {otherStatuses.map((group, idx) => (
            <button
              key={group.user.id}
              onClick={() =>
                setViewerState({
                  open: true,
                  userIndex: ownStatuses ? idx + 1 : idx,
                })
              }
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="h-16 w-16 rounded-full p-[3px] bg-gradient-to-br from-violet-500 via-pink-500 to-amber-500">
                <div className="h-full w-full rounded-full overflow-hidden bg-white p-[2px]">
                  <div className="h-full w-full rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
                    {group.user.avatarUrl ? (
                      <img
                        src={group.user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-zinc-600">
                        {(group.user.name || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-zinc-600 w-16 text-center truncate">
                {(group.user.name || "Unknown").split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-zinc-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-zinc-100 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-zinc-100 rounded w-1/4 animate-pulse" />
                </div>
              </div>
              <div className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : statuses.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="text-zinc-500 font-medium">No stories yet</p>
          <p className="text-sm text-zinc-400 mt-1">Be the first to share a status!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedByUser.map((group) => (
            <div
              key={group.user.id}
              className="bg-white border border-zinc-100 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => {
                  const viewerIdx = group.user.id === currentUserId
                    ? 0
                    : (ownStatuses ? otherStatuses.indexOf(group) + 1 : otherStatuses.indexOf(group))
                  setViewerState({ open: true, userIndex: viewerIdx })
                }}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 p-4 pb-2">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                    {group.user.avatarUrl ? (
                      <img
                        src={group.user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-zinc-600">
                        {(group.user.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{group.user.name || "Unknown"}</p>
                    <p className="text-xs text-zinc-400">
                      {group.statuses.length} {group.statuses.length === 1 ? "status" : "statuses"}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <div className="h-32 sm:h-48 rounded-xl overflow-hidden bg-zinc-100">
                    {group.statuses[0]?.mediaUrl ? (
                      <img
                        src={group.statuses[0].mediaUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (() => {
                      try {
                        const parsed = JSON.parse(group.statuses[0].content)
                        return (
                          <div
                            className="h-full w-full flex items-center justify-center p-4"
                            style={{ backgroundColor: parsed.bgColor || "#059669" }}
                          >
                            <p className="text-white text-sm sm:text-lg font-medium text-center line-clamp-3">
                              {parsed.text}
                            </p>
                          </div>
                        )
                      } catch {
                        return (
                          <div className="h-full w-full flex items-center justify-center p-4 bg-emerald-600">
                            <p className="text-white text-sm sm:text-lg font-medium text-center line-clamp-3">
                              {group.statuses[0].content}
                            </p>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreator && (
        <StoryCreator
          onClose={() => setShowCreator(false)}
          onCreated={handleStatusCreated}
        />
      )}

      {viewerState.open && groupedByUser.length > 0 && (
        <StoryViewer
          stories={groupedByUser}
          initialUserIndex={Math.min(viewerState.userIndex, groupedByUser.length - 1)}
          currentUserId={currentUserId}
          onClose={() => setViewerState({ open: false, userIndex: 0 })}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
