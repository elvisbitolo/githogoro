"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import {
  Copy, Check, Share2, MessageCircle, Users, ArrowLeft, Sparkles,
  Globe,
  Send as SendIcon
} from "lucide-react"
import Link from "next/link"

export default function InvitePage() {
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState("")
  const [userName, setUserName] = useState("")
  const supabase = createClient()

  const inviteUrl = "https://githogoro.vercel.app/signup"
  const defaultMessage = "Join Githogoro — the community app for Githogoro residents! Stay connected, find services, and get local updates. Sign up free at"
  const shareText = customMessage || `${defaultMessage} ${inviteUrl}`

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        fetch(`/api/profiles/me`)
          .then((res) => res.ok ? res.json() : null)
          .then((data) => { if (data?.name) setUserName(data.name) })
      }
    })
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback */ }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Githogoro",
          text: shareText,
          url: inviteUrl,
        })
      } catch { /* cancelled */ }
    }
  }

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, "_blank")
  }

  const shareSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`
    window.location.href = url
  }

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`
    window.open(url, "_blank")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Invite Friends</h1>
          <p className="text-sm text-zinc-500">Grow the Githogoro community</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="mb-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-emerald-200" />
          <h2 className="text-xl font-bold mb-1">Every invite counts</h2>
          <p className="text-emerald-100 text-sm">
            Help us grow the Githogoro community. The more residents join, the stronger we become.
          </p>
        </CardContent>
      </Card>

      {/* Invite Link */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-zinc-900 mb-3">Your Invite Link</h3>
          <div className="flex items-center gap-2">
            <Input
              value={inviteUrl}
              readOnly
              className="flex-1 bg-zinc-50 text-sm font-mono"
            />
            <Button
              onClick={copyLink}
              variant={copied ? "default" : "outline"}
              className={copied ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {copied ? (
                <><Check className="h-4 w-4 mr-1" /> Copied</>
              ) : (
                <><Copy className="h-4 w-4 mr-1" /> Copy</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-zinc-900 mb-3">Customize Your Message</h3>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={defaultMessage}
            className="w-full min-h-[100px] resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
          />
          <p className="text-xs text-zinc-400 mt-2">
            {userName ? `Sent as ${userName}` : "Your invite link will be included automatically"}
          </p>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-zinc-900 mb-4">Share via</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              onClick={shareWhatsApp}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={shareSMS}
            >
              <SendIcon className="h-6 w-6" />
              <span className="text-xs font-medium">SMS</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              onClick={shareFacebook}
            >
              <Globe className="h-6 w-6" />
              <span className="text-xs font-medium">Facebook</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
              onClick={shareNative}
            >
              <Share2 className="h-6 w-6" />
              <span className="text-xs font-medium">More</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-zinc-900 mb-3">Invite Tips</h3>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <Users className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              Share with neighbors in Githogoro zones
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              Send to local WhatsApp groups
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              Personalize your message for better results
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
