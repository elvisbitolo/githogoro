"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, MicOff, Play, Pause, Square, Send, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void
  onCancel?: () => void
}

type RecorderState = "idle" | "recording" | "preview" | "unsupported"

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle")
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasMicrophone, setHasMicrophone] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const startTimeRef = useRef<number>(0)

  const MAX_DURATION = 60
  const WARNING_DURATION = 50

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const checkMicrophone = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch {
      return false
    }
  }

  const startRecording = useCallback(async () => {
    const micAvailable = await checkMicrophone()
    if (!micAvailable) {
      setHasMicrophone(false)
      setState("unsupported")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/wav"

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        blobRef.current = blob
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        setState("preview")

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }

      recorder.start(100)
      startTimeRef.current = Date.now()
      setState("recording")
      setDuration(0)

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(elapsed)

        if (elapsed >= MAX_DURATION) {
          stopRecording()
        }
      }, 1000)
    } catch (err) {
      console.error("Failed to start recording:", err)
      setHasMicrophone(false)
      setState("unsupported")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }

    setAudioURL(null)
    setDuration(0)
    setCurrentTime(0)
    setIsPlaying(false)
    blobRef.current = null
    setState("idle")
  }, [audioURL])

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

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime))
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSend = () => {
    if (blobRef.current) {
      onSend(blobRef.current, duration)
      cancelRecording()
    }
  }

  const handleDiscard = () => {
    cancelRecording()
  }

  const remainingSeconds = MAX_DURATION - duration
  const isWarning = duration >= WARNING_DURATION && duration < MAX_DURATION

  if (state === "unsupported") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
        <MicOff className="h-4 w-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Microphone not available. Voice notes require microphone access.
        </p>
        {onCancel && (
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
      {state === "idle" && (
        <>
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-800 shadow-sm flex-shrink-0"
            onClick={startRecording}
          >
            <Mic className="h-4 w-4 text-white" />
          </Button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Tap to record a voice note
          </span>
          {onCancel && (
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </>
      )}

      {state === "recording" && (
        <>
          <div className="relative flex-shrink-0">
            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-full shadow-sm"
              onClick={stopRecording}
            >
              <Square className="h-4 w-4 text-white" />
            </Button>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className={`text-sm font-mono font-medium ${
                isWarning
                  ? "text-red-500 dark:text-red-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {formatTime(duration)}
            </span>
            {isWarning && (
              <span className="text-xs text-red-400 dark:text-red-500">
                {remainingSeconds}s remaining
              </span>
            )}
          </div>

          <div className="flex-1 mx-2">
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(duration / MAX_DURATION) * 100}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={cancelRecording}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}

      {state === "preview" && audioURL && (
        <>
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-800 shadow-sm flex-shrink-0"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white ml-0.5" />
            )}
          </Button>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-200"
                  style={{
                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                  }}
                />
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={audioURL}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={handleAudioEnded}
            preload="metadata"
          />

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
              onClick={handleDiscard}
              title="Discard recording"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 bg-emerald-700 hover:bg-emerald-800"
              onClick={handleSend}
              title="Send voice note"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
