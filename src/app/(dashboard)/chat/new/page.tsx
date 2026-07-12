"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewChatRoomPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState("")
  const [type, setType] = useState("general")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create a chat room.")
      setSubmitting(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from("chat_rooms")
      .insert({ name, type, description, created_by: user.id })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    router.push(`/chat/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/chat"
            className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-400" />
          </Link>
          <h1 className="text-2xl font-bold text-white">New Chat Room</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Room Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Downtown Neighbors"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Room Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white ring-offset-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  <option value="general">General</option>
                  <option value="community">Community</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this room about?"
                  rows={3}
                  className="flex w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 ring-offset-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-900/50 border border-red-800 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Creating..." : "Create Chat Room"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
