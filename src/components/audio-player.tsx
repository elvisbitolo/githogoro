"use client"

import { useState, useRef, useCallback } from "react"
import { Play, Pause } from "lucide-react"

interface AudioPlayerProps {
  src: string
  duration?: number
}

export function AudioPlayer({ src, duration: propDuration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [loadedDuration, setLoadedDuration] = useState(propDuration ?? 0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const duration = propDuration ?? loadedDuration

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current && !propDuration) {
      setLoadedDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    audioRef.current.currentTime = percentage * duration
  }

  return (
    <div className="inline-flex items-center gap-2 max-w-[200px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <button
        onClick={togglePlayback}
        className="h-7 w-7 rounded-full bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 text-white" />
        ) : (
          <Play className="h-3.5 w-3.5 text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div
          className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden cursor-pointer"
          onClick={handleBarClick}
        >
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono leading-none">
            {formatTime(currentTime)}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono leading-none">
            {duration > 0 ? formatTime(duration) : "--:--"}
          </span>
        </div>
      </div>
    </div>
  )
}
