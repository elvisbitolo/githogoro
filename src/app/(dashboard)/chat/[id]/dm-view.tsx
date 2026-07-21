"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send, ArrowLeft, Paperclip, Smile, Mic, Image as ImageIcon,
  MoreVertical, Reply, Star, Trash2, Edit3, Forward, Pin,
  Search, X, Check, CheckCheck, MapPin, Circle, Phone, Video
} from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import { CallView } from "./call-view"

const EMOJI_LIST = ["😀","😂","😍","🥰","😎","🤩","😭","🥺","🔥","💯","👍","❤️","🎉","🤔","😢","🙏","💪","🤝","👏","✅","⭐","📌","🎵","📸","💡"]

export function DMView({ conversation }: { conversation: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [replyTo, setReplyTo] = useState<any>(null)
  const [editingMsg, setEditingMsg] = useState<any>(null)
  const [typing, setTyping] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())
  const [showStarred, setShowStarred] = useState(false)
  const [showCall, setShowCall] = useState(false)
  const [callType, setCallType] = useState<"audio" | "video">("audio")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null)
  const supabase = createClient()

  const otherParticipant = conversation?.participants?.find(
    (p: any) => p.userId !== userId
  )?.user

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        // Mark conversation as read
        fetch(`/api/conversations/${conversation.id}/read`, { method: "POST" })
      }
    })

    // Load messages
    fetch(`/api/conversations/${conversation.id}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data)
          const starred = new Set(data.filter((m: any) => m.isStarred).map((m: any) => m.id))
          setStarredIds(starred)
        }
        setLoading(false)
      })

    // Real-time subscription for new messages
    const channel = supabase
      .channel(`dm:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any
          if (newMsg.senderId !== userId) {
            setMessages((prev) => [...prev, newMsg])
            // Mark as read
            fetch(`/api/conversations/${conversation.id}/read`, { method: "POST" })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "private_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const updated = payload.new as any
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          )
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId !== userId) {
          setOtherTyping(true)
          setTimeout(() => setOtherTyping(false), 3000)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleTyping = useCallback(() => {
    if (!typing) {
      setTyping(true)
      supabase.channel(`dm:${conversation.id}`).send({
        type: "broadcast",
        event: "typing",
        payload: { userId },
      })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000)
  }, [typing, userId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const body: any = { text: newMessage.trim() }
    if (replyTo) {
      body.replyToId = replyTo.id
      setReplyTo(null)
    }
    if (editingMsg) {
      body.editId = editingMsg.id
      body.text = newMessage.trim()
      setEditingMsg(null)
    }

    setNewMessage("")
    setShowEmoji(false)

    const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const msg = await res.json()
      if (!messages.find((m) => m.id === msg.id)) {
        setMessages((prev) => [...prev, msg])
      }
    }
  }

  const toggleReaction = async (messageId: string, emoji: string) => {
    await fetch(`/api/messages/${messageId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    })
  }

  const toggleStar = async (messageId: string) => {
    await fetch(`/api/messages/${messageId}/star`, { method: "POST" })
    setStarredIds((prev) => {
      const next = new Set(prev)
      if (next.has(messageId)) next.delete(messageId)
      else next.add(messageId)
      return next
    })
  }

  const deleteMessage = async (messageId: string) => {
    await fetch(`/api/messages/${messageId}/delete`, { method: "POST" })
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, text: null } : m))
    )
  }

  const editMessage = (msg: any) => {
    setEditingMsg(msg)
    setNewMessage(msg.text)
    inputRef.current?.focus()
  }

  const getReplyMessage = (replyToId: string) =>
    messages.find((m) => m.id === replyToId)

  const filteredMessages = showSearch && searchQuery
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : showStarred
    ? messages.filter((m) => starredIds.has(m.id))
    : messages

  const isOnline = otherParticipant?.lastActiveAt &&
    new Date(otherParticipant.lastActiveAt).getTime() > Date.now() - 5 * 60 * 1000

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-dvh bg-zinc-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 sm:px-4 h-14 border-b border-zinc-200 bg-white shrink-0">
        <Link href="/chat" className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>
        <Avatar className="h-9 w-9">
          <AvatarImage src={otherParticipant?.avatarUrl} />
          <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
            {(otherParticipant?.name || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{otherParticipant?.name || "Conversation"}</h2>
          <p className="text-xs text-zinc-400">
            {otherTyping ? (
              <span className="text-emerald-600 font-medium">typing...</span>
            ) : isOnline ? (
              <span className="text-green-600">online</span>
            ) : otherParticipant?.lastActiveAt ? (
              `last seen ${formatRelativeTime(otherParticipant.lastActiveAt)}`
            ) : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCallType("audio"); setShowCall(true) }}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-100 text-emerald-600 transition-colors"
            title="Audio Call"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setCallType("video"); setShowCall(true) }}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-100 text-emerald-600 transition-colors"
            title="Video Call"
          >
            <Video className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setShowSearch(!showSearch); setShowStarred(false); setSearchQuery("") }}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${showSearch ? "bg-emerald-100 text-emerald-700" : "hover:bg-zinc-100 text-zinc-500"}`}
          >
            {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
          <button
            onClick={() => { setShowStarred(!showStarred); setShowSearch(false) }}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${showStarred ? "bg-amber-100 text-amber-700" : "hover:bg-zinc-100 text-zinc-500"}`}
          >
            <Star className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 text-zinc-500"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-50">
                <button
                  onClick={() => { setShowStarred(true); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-zinc-50 flex items-center gap-2"
                >
                  <Star className="h-4 w-4" /> Starred Messages
                </button>
                <button className="w-full px-4 py-2 text-sm text-left hover:bg-zinc-50 flex items-center gap-2 text-red-600">
                  <Trash2 className="h-4 w-4" /> Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-white border-b border-zinc-200 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400 text-sm">
              {showStarred ? "No starred messages" : showSearch ? "No messages match" : "No messages yet. Say hello!"}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const isOwn = msg.senderId === userId
            const showAvatar = !isOwn && (idx === 0 || filteredMessages[idx - 1]?.senderId !== msg.senderId)
            const replyMsg = msg.replyToId ? getReplyMessage(msg.replyToId) : null
            const reactions = msg.reactions || []

            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showAvatar ? "mt-3" : "mt-0.5"}`}>
                <div className={`flex gap-1.5 max-w-[80%] sm:max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && (
                    <Avatar className={`h-7 w-7 shrink-0 ${showAvatar ? "visible" : "invisible"}`}>
                      <AvatarImage src={msg.sender?.avatarUrl} />
                      <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">
                        {(msg.sender?.name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="group relative">
                    {/* Reply preview */}
                    {replyMsg && (
                      <div className={`text-[10px] px-2 py-1 rounded-t-xl border-l-2 mb-0 ${isOwn ? "bg-emerald-600 border-emerald-400 text-emerald-100" : "bg-zinc-200 border-zinc-400 text-zinc-600"}`}>
                        <p className="font-medium">{replyMsg.sender?.name}</p>
                        <p className="truncate opacity-80">{replyMsg.text || "Media"}</p>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm break-words ${
                        msg.isDeleted
                          ? "bg-zinc-100 text-zinc-400 italic"
                          : isOwn
                          ? "bg-emerald-700 text-white rounded-br-md"
                          : "bg-white text-zinc-900 rounded-bl-md border border-zinc-100"
                      } ${replyMsg ? (isOwn ? "rounded-tr-md" : "rounded-tl-md") : ""}`}
                    >
                      {msg.isEdited && !msg.isDeleted && (
                        <span className="text-[10px] opacity-60 italic">edited </span>
                      )}
                      {msg.type === "image" && msg.mediaUrl && (
                        <img src={msg.mediaUrl} alt="shared" className="rounded-lg mb-1 max-w-full" />
                      )}
                      {msg.type === "voice" && msg.mediaUrl && (
                        <audio controls src={msg.mediaUrl} className="w-full h-8 mb-1" />
                      )}
                      {msg.type === "location" && msg.mediaUrl && (
                        <div className="flex items-center gap-1 text-emerald-200">
                          <MapPin className="h-4 w-4" />
                          <span>Location shared</span>
                        </div>
                      )}
                      {!msg.isDeleted && <p>{msg.text}</p>}

                      <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[10px] ${isOwn ? "text-emerald-200" : "text-zinc-400"}`}>
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          msg.readAt ? (
                            <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-emerald-200" />
                          )
                        )}
                        {starredIds.has(msg.id) && (
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {reactions.length > 0 && (
                      <div className={`flex gap-0.5 mt-0.5 flex-wrap ${isOwn ? "justify-end" : ""}`}>
                        {reactions.map((r: any, ri: number) => (
                          <span key={ri} className="text-xs bg-white border border-zinc-200 rounded-full px-1.5 py-0.5 shadow-sm cursor-pointer hover:bg-zinc-50">
                            {r.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Hover actions */}
                    {!msg.isDeleted && (
                      <div className={`absolute top-0 ${isOwn ? "left-0 -translate-x-full -ml-1" : "right-0 translate-x-full mr-1"} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white rounded-lg shadow-md border border-zinc-200 px-1 py-0.5`}>
                        <button
                          onClick={() => setReplyTo(msg)}
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 text-zinc-500"
                          title="Reply"
                        >
                          <Reply className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => toggleStar(msg.id)}
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 text-zinc-500"
                          title="Star"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                        {isOwn && (
                          <>
                            <button
                              onClick={() => editMessage(msg)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 text-zinc-500"
                              title="Edit"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <button
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 text-zinc-500"
                          title="React"
                          onClick={() => toggleReaction(msg.id, "👍")}
                        >
                          <Smile className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply / Edit indicator */}
      {(replyTo || editingMsg) && (
        <div className="px-4 py-2 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0">
          <div className="flex-1 min-w-0 border-l-2 border-emerald-500 pl-2">
            <p className="text-xs font-medium text-zinc-600">
              {editingMsg ? "Editing message" : `Replying to ${replyTo?.sender?.name}`}
            </p>
            <p className="text-xs text-zinc-400 truncate">{editingMsg?.text || replyTo?.text}</p>
          </div>
          <button
            onClick={() => { setReplyTo(null); setEditingMsg(null); setNewMessage("") }}
            className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100"
          >
            <X className="h-4 w-4 text-zinc-500" />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="px-4 py-2 bg-white border-t border-zinc-200 shrink-0">
          <div className="flex flex-wrap gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setNewMessage((prev) => prev + emoji)}
                className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-zinc-100 text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="px-3 py-3 bg-white border-t border-zinc-200 shrink-0">        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${showEmoji ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-500"}`}
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 text-zinc-500"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder={editingMsg ? "Edit message..." : "Type a message..."}
            className="flex-1 h-10 rounded-xl bg-zinc-100 border-0 focus-visible:ring-1 focus-visible:ring-emerald-600"
          />
          {newMessage.trim() ? (
            <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-emerald-700 hover:bg-emerald-800">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <button
              type="button"
              className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 text-zinc-500"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Call Overlay */}
      {showCall && (
        <CallView
          conversationId={conversation.id}
          otherUser={otherParticipant ? {
            id: otherParticipant.userId || "",
            name: otherParticipant.name || "Unknown",
            avatarUrl: otherParticipant.avatarUrl,
          } : null}
          onEnd={() => setShowCall(false)}
        />
      )}
    </div>
  )
}
