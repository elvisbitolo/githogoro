"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewConversationPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [status, setStatus] = useState("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    supabase.from("profiles").select("*").eq("id", userId).single().then(({ data }) => {
      if (cancelled) return
      if (!data) {
        setStatus("not-found")
        return
      }
      setProfile(data)
    })

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setStatus("error")
        setErrorMsg("You must be logged in.")
        return
      }

      try {
        const { data: myConvs } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", user.id)

        const ids = myConvs?.map((c: any) => c.conversation_id) || []

        if (ids.length > 0) {
          const { data: existing } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .in("conversation_id", ids)
            .eq("user_id", userId)
            .maybeSingle()

          if (existing) {
            router.push(`/messages/${existing.conversation_id}`)
            return
          }
        }

        const { data: conv, error: convErr } = await supabase
          .from("conversations")
          .insert({})
          .select()
          .single()

        if (!conv || convErr) {
          setStatus("error")
          setErrorMsg(convErr?.message || "Failed to create conversation.")
          return
        }

        const { error: partErr } = await supabase.from("conversation_participants").insert([
          { conversation_id: conv.id, user_id: user.id },
          { conversation_id: conv.id, user_id: userId },
        ])

        if (partErr) {
          setStatus("error")
          setErrorMsg(partErr.message)
          return
        }

        router.push(`/messages/${conv.id}`)
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error")
          setErrorMsg(err?.message || "Something went wrong.")
        }
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (status === "not-found") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/people" className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Link>
          <h1 className="text-2xl font-bold">New Conversation</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center py-12">
            <p className="text-zinc-500">User not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/people" className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Link>
          <h1 className="text-2xl font-bold">New Conversation</h1>
        </div>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
            <p className="text-red-600 font-medium">Could not start conversation</p>
            <p className="text-sm text-zinc-500 mt-1">{errorMsg || "Please try again."}</p>
            <Link
              href="/people"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Back to People
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/people" className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="h-4 w-4 text-zinc-600" />
        </Link>
        <h1 className="text-2xl font-bold">New Conversation</h1>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center py-12">
          {profile && (
            <>
              <Avatar className="h-16 w-16 mb-4">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-xl bg-emerald-100 text-emerald-700">
                  {(profile.name || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium">{profile.name}</p>
              <p className="text-sm text-zinc-500 mt-1">{profile.phone}</p>
            </>
          )}
          <p className="text-sm text-zinc-400 mt-4">
            {status === "loading" ? "Setting up conversation..." : "Redirecting..."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
