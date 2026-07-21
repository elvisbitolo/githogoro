"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

interface StoryUser {
  user: { id: string; name: string; avatarUrl: string | null }
  statuses: {
    id: string
    content: string
    mediaUrl: string | null
    createdAt: string
  }[]
}

interface StoryViewerProps {
  stories: StoryUser[]
  initialUserIndex: number
  currentUserId: string | null
  onClose: () => void
  onDelete: (statusId: string) => void
}

const STATUS_DURATION = 5000

function parseContent(content: string): { text?: string; bgColor?: string } {
  try {
    return JSON.parse(content)
  } catch {
    return { text: content }
  }
}

export default function StoryViewer({
  stories,
  initialUserIndex,
  currentUserId,
  onClose,
  onDelete,
}: StoryViewerProps) {
  const [userIndex, setUserIndex] = useState(initialUserIndex)
  const [statusIndex, setStatusIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)

  const currentUser = stories[userIndex]
  const currentStatus = currentUser?.statuses[statusIndex]
  const parsed = currentStatus ? parseContent(currentStatus.content) : {}

  const goNext = useCallback(() => {
    const cur = stories[userIndex]
    if (statusIndex < cur.statuses.length - 1) {
      setStatusIndex((i) => i + 1)
      setProgress(0)
    } else if (userIndex < stories.length - 1) {
      setUserIndex((i) => i + 1)
      setStatusIndex(0)
      setProgress(0)
    } else {
      onClose()
    }
  }, [userIndex, statusIndex, stories, onClose])

  const goPrev = useCallback(() => {
    if (statusIndex > 0) {
      setStatusIndex((i) => i - 1)
      setProgress(0)
    } else if (userIndex > 0) {
      setUserIndex((i) => i - 1)
      const prev = stories[userIndex - 1]
      setStatusIndex(prev.statuses.length - 1)
      setProgress(0)
    }
  }, [userIndex, statusIndex, stories])

  useEffect(() => {
    if (paused) return

    const start = Date.now()
    let raf: number

    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / STATUS_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        goNext()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [userIndex, statusIndex, paused, goNext])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        goNext()
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goPrev()
      }
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goNext, goPrev, onClose])

  const handleDelete = async () => {
    if (!currentStatus) return
    await fetch(`/api/statuses/${currentStatus.id}`, { method: "DELETE" })
    onDelete(currentStatus.id)
    if (currentUser.statuses.length <= 1) {
      if (userIndex < stories.length - 1) {
        setUserIndex((i) => i + 1)
        setStatusIndex(0)
      } else {
        onClose()
      }
    } else {
      if (statusIndex >= currentUser.statuses.length - 1) {
        setStatusIndex((i) => i - 1)
      }
    }
    setProgress(0)
  }

  const isOwn = currentUserId === currentUser?.user.id

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {userIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-2 sm:left-6 z-50 h-10 w-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {userIndex < stories.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-2 sm:right-6 z-50 h-10 w-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div
        className="absolute inset-0 sm:inset-x-[15%] sm:inset-y-0 sm:rounded-2xl overflow-hidden"
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="absolute inset-0 bg-zinc-900" />

        {currentStatus?.mediaUrl ? (
          <img
            src={currentStatus.mediaUrl}
            alt="Status"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center p-8"
            style={{ backgroundColor: parsed.bgColor || "#059669" }}
          >
            <p className="text-white text-xl sm:text-2xl md:text-3xl font-medium text-center break-words">
              {parsed.text || ""}
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 pt-2 px-2 flex gap-1 z-10">
          {currentUser?.statuses.map((_, idx) => (
            <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    idx < statusIndex
                      ? "100%"
                      : idx === statusIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-4 px-4 flex items-center gap-3 z-10 pt-2">
          <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-white/80 bg-zinc-200 shrink-0">
            {currentUser?.user.avatarUrl ? (
              <img
                src={currentUser.user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-zinc-600">
                {(currentUser?.user.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {currentUser?.user.name || "Unknown"}
            </p>
            <p className="text-white/60 text-xs">
              {currentStatus
                ? new Date(currentStatus.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>

          {isOwn && currentStatus && (
            <button
              onClick={handleDelete}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer sm:hidden"
        onClick={goPrev}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/3 z-40 cursor-pointer sm:hidden"
        onClick={goNext}
      />
    </div>
  )
}
