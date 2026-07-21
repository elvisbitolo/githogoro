"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { GroupChat } from "./group-chat"

export default function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    fetch(`/api/groups/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setGroup(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] lg:h-dvh">
        <p className="text-zinc-500">Group not found</p>
      </div>
    )
  }

  return <GroupChat group={group} />
}
