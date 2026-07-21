"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
  Maximize2, Minimize2, X
} from "lucide-react"

interface CallViewProps {
  conversationId: string
  otherUser: { id: string; name: string; avatarUrl: string | null } | null
  isIncoming?: boolean
  onEnd: () => void
}

export function CallView({ conversationId, otherUser, isIncoming = false, onEnd }: CallViewProps) {
  const [callState, setCallState] = useState<"ringing" | "connecting" | "active" | "ended">(isIncoming ? "ringing" : "ringing")
  const [isVideo, setIsVideo] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [duration, setDuration] = useState(0)
  const [userId, setUserId] = useState("")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current?.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { candidate: event.candidate, userId },
        })
      }
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallState("active")
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
      }
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall()
      }
    }

    peerConnectionRef.current = pc
    return pc
  }, [userId])

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      })
      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const pc = createPeerConnection()
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      channelRef.current?.send({
        type: "broadcast",
        event: "call-offer",
        payload: { offer, userId, isVideo },
      })

      setCallState("connecting")
    } catch (err) {
      console.error("Failed to start call:", err)
      endCall()
    }
  }, [isVideo, createPeerConnection, userId])

  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit, callerIsVideo: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callerIsVideo,
      })
      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      if (callerIsVideo) setIsVideo(true)

      const pc = createPeerConnection()
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      channelRef.current?.send({
        type: "broadcast",
        event: "call-answer",
        payload: { answer, userId },
      })

      setCallState("connecting")
    } catch (err) {
      console.error("Failed to answer call:", err)
      endCall()
    }
  }, [createPeerConnection, userId])

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    peerConnectionRef.current?.close()
    if (timerRef.current) clearInterval(timerRef.current)

    channelRef.current?.send({
      type: "broadcast",
      event: "call-end",
      payload: { userId },
    })

    setCallState("ended")
    setTimeout(onEnd, 500)
  }, [userId, onEnd])

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = isMuted })
    setIsMuted(!isMuted)
  }

  const toggleVideo = async () => {
    if (isVideoOff) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        const videoTrack = stream.getVideoTracks()[0]
        peerConnectionRef.current?.addTrack(videoTrack, stream)
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
        localStreamRef.current?.addTrack(videoTrack)
      } catch { /* denied */ }
    } else {
      localStreamRef.current?.getVideoTracks().forEach((t) => t.stop())
      localStreamRef.current?.getTracks().filter((t) => t.kind === "video").forEach((t) => t.stop())
    }
    setIsVideoOff(!isVideoOff)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel(`call:${conversationId}`)
    channelRef.current = channel

    channel
      .on("broadcast", { event: "call-offer" }, (payload: any) => {
        if (payload.payload.userId !== userId) {
          setCallState("ringing")
        }
      })
      .on("broadcast", { event: "call-answer" }, (payload: any) => {
        if (payload.payload.userId !== userId && peerConnectionRef.current) {
          peerConnectionRef.current.setRemoteDescription(payload.payload.answer)
        }
      })
      .on("broadcast", { event: "ice-candidate" }, (payload: any) => {
        if (payload.payload.userId !== userId && peerConnectionRef.current) {
          peerConnectionRef.current.addIceCandidate(payload.payload.candidate)
        }
      })
      .on("broadcast", { event: "call-end" }, () => {
        endCall()
      })
      .subscribe()

    if (!isIncoming) {
      startCall()
    }

    return () => {
      supabase.removeChannel(channel)
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      peerConnectionRef.current?.close()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [userId, conversationId])

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isFullscreen ? "" : "items-center justify-center"} bg-zinc-950`}>
      {/* Remote Video */}
      {isVideo && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={isFullscreen ? "w-full h-full object-cover" : "w-full max-w-3xl aspect-video rounded-2xl object-cover"}
        />
      )}

      {/* Local Video (PiP) */}
      {isVideo && !isVideoOff && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-32 right-4 w-32 h-24 rounded-xl object-cover border-2 border-white/20 z-10"
        />
      )}

      {/* Call Status Overlay (audio only or ringing) */}
      {!isVideo && (
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-white/20">
            <AvatarImage src={otherUser?.avatarUrl || undefined} />
            <AvatarFallback className="text-3xl bg-emerald-700 text-white">
              {(otherUser?.name || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{otherUser?.name || "Unknown"}</h2>
            <p className="text-zinc-400 text-sm mt-1">
              {callState === "ringing" && "Ringing..."}
              {callState === "connecting" && "Connecting..."}
              {callState === "active" && formatDuration(duration)}
              {callState === "ended" && "Call ended"}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`flex items-center gap-4 ${isFullscreen ? "absolute bottom-8 left-1/2 -translate-x-1/2" : "mt-8"}`}>
        <Button
          onClick={toggleMute}
          size="icon"
          className={`h-14 w-14 rounded-full ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}
        >
          {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
        </Button>

        <Button
          onClick={endCall}
          size="icon"
          className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="h-7 w-7 text-white" />
        </Button>

        {isVideo && (
          <Button
            onClick={toggleVideo}
            size="icon"
            className={`h-14 w-14 rounded-full ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
          </Button>
        )}

        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          size="icon"
          className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20"
        >
          {isFullscreen ? <Minimize2 className="h-6 w-6 text-white" /> : <Maximize2 className="h-6 w-6 text-white" />}
        </Button>
      </div>
    </div>
  )
}
